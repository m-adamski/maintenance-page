import Head from "next/head";
import { readFile } from "fs/promises";
import type { GetServerSideProps, NextPage } from "next";

type AcceptLanguage = {
    code: string,
    region: string | null,
    quality: number
}

const Home: NextPage = ({ translation }: any) => {
    const t = (value: string) => {
        if (value in translation) {
            return translation[value];
        }

        return value;
    }

    return (
        <div>
            <Head>
                <meta charSet="utf-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <link rel="icon" href="/favicon.ico"/>
                <title>{ t("We'll be back soon!") }</title>
            </Head>

            <main
                className="flex flex-row flex-nowrap justify-center items-center w-full min-h-screen dark:bg-gray-800 dark:text-stone-300">
                <div className="w-full max-w-7xl p-5">
                    <h1 className="font-light text-5xl text-sky-500 mb-6">{ t("We'll be back soon!") }</h1>
                    <p>{ t("Sorry for the inconvenience but we're performing some maintenance at the moment.") }</p>
                    <p>{ t("Please be patient - we'll be back shortly!") }</p>
                </div>
            </main>
        </div>
    )
}

/**
 * Parse base language from Accept-Language header.
 * https://stackoverflow.com/a/14438954
 * https://github.com/opentable/accept-language-parser
 * https://www.benmvp.com/blog/filtering-undefined-elements-from-array-typescript/
 *
 * @param value
 */
const parseAcceptLanguage = (value: string): Array<AcceptLanguage> => {
    const regex = /((([a-zA-Z]+(-[a-zA-Z0-9]+){0,2})|\*)(;q=[0-1](\.[0-9]+)?)?)/g;
    const regexMatches = value.match(regex) || [];

    return regexMatches.map(match => {
        if (!match) return null;

        const bits = match.split(";");
        const ietf = bits[0].split("-");
        const hasScript = ietf.length === 3;

        return {
            code: ietf[0],
            region: (hasScript ? ietf[2] : ietf[1]) || null,
            quality: bits[1] ? parseFloat(bits[1].split("=")[1]) : 1.0
        }
    }).filter((value): value is AcceptLanguage => {
        return value !== null;
    }).sort((a, b) => {
        return b.quality - a.quality;
    });
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    let translation = {};
    const acceptLanguage = context.req.headers["accept-language"];
    const acceptLocales = parseAcceptLanguage(acceptLanguage || "")
        .map(value => {
            return value.code;
        }).filter((value, index, array) => {
            return array.indexOf(value) === index;
        });

    // Iterate every acceptance language and find matching translation
    for (let i = 0; i < acceptLocales.length; i++) {
        const transLang = acceptLocales[i];
        const transPath = `./locales/${ transLang }.json`;

        try {
            const transContent = await readFile(transPath, { encoding: "utf8", flag: "r" });
            translation = JSON.parse(transContent);
            break;
        } catch (err) {
            console.log(`Language translation file for "${ transLang }" not found`);
        }
    }

    return {
        props: {
            translation: translation
        }
    }
}

export default Home
