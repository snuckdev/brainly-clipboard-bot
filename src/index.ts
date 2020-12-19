import axios from 'axios';
import open from 'open';
import cheerio from 'cheerio';
import clipboardy from 'clipboardy';
import chalk from 'chalk';

const headers = {
  'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.101 Safari/537.36',
};

function printAsciiLogo() {
  console.log(`
  ██████╗ ██████╗  █████╗ ██╗███╗   ██╗██╗  ██╗   ██╗       ██╗     ██╗███████╗████████╗███████╗███╗   ██╗███████╗██████╗  ${chalk.blue('████████╗███████╗')}
  ██╔══██╗██╔══██╗██╔══██╗██║████╗  ██║██║  ╚██╗ ██╔╝       ██║     ██║██╔════╝╚══██╔══╝██╔════╝████╗  ██║██╔════╝██╔══██╗ ${chalk.blue('╚══██╔══╝██╔════╝')}
  ██████╔╝██████╔╝███████║██║██╔██╗ ██║██║   ╚████╔╝ █████╗ ██║     ██║███████╗   ██║   █████╗  ██╔██╗ ██║█████╗  ██████╔╝ ${chalk.blue('   ██║   ███████╗')}
  ██╔══██╗██╔══██╗██╔══██║██║██║╚██╗██║██║    ╚██╔╝  ╚════╝ ██║     ██║╚════██║   ██║   ██╔══╝  ██║╚██╗██║██╔══╝  ██╔══██╗ ${chalk.blue('   ██║   ╚════██║')}
  ██████╔╝██║  ██║██║  ██║██║██║ ╚████║███████╗██║          ███████╗██║███████║   ██║   ███████╗██║ ╚████║███████╗██║  ██║ ${chalk.blue('   ██║   ███████║')}
  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝╚══════╝╚═╝          ╚══════╝╚═╝╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ${chalk.blue('   ╚═╝   ╚══════╝')}
                                                                                                                                                                                                                       
  `);
}

function getRequestUrl(query: string) {
  const baseUrl = `https://www.google.com/search?sxsrf=ALeKk02hgZQm-GEdAwirFIHl6CSgPEOUZg%3A1608338316761&source=hp&ei=jEvdX_3aK_uz5OUPo_yU0AU&q=${query}&oq=${query}&gs_lcp=CgZwc3ktYWIQAzIFCAAQsQMyBQgAELEDMgUIABCxAzIFCAAQsQMyAggAMgIIADICCAAyAggAMgUIABCxAzICCAA6BwgjEOoCECc6BggjECcQEzoECCMQJzoICAAQsQMQgwE6BQguELEDOggIABDHARCvAToLCAAQsQMQxwEQowI6BAgAEEM6CAguELEDEIMBOggIABDHARCjAjoHCAAQsQMQQzoFCAAQywE6BggAEBYQHlCgCFiYGmCDPmgIcAB4AIAB1gGIAaMOkgEGMS4xMS4xmAEAoAEBqgEHZ3dzLXdperABCg&sclient=psy-ab&ved=0ahUKEwj90K-Q59jtAhX7GbkGHSM-BVoQ4dUDCAc&uact=5`;
  return encodeURI(baseUrl);
}

function openAnswerInBrowser(query: string) {
  const uris: string[] = [];

  axios.get(getRequestUrl(query), { headers, maxRedirects: 0 }).then((response) => {
    const pageData = response.data;
    const $ = cheerio.load(pageData);

    $(pageData).find('a').each((i, el) => {
      const href = $(el).attr('href');
      if (href?.includes('brainly') && !href?.includes('https://webcache.googleusercontent.com') && !href?.includes('https://translate.google.com') && !href.startsWith('/search?q')) {
        uris.push(href);
      }
    });

    if (uris.length !== 0) {
      console.log(chalk.green('✔ Links encontrados:'));

      uris.forEach((uri) => {
        console.log(chalk.green(uri));
      });

      open(uris[0]);
    } else {
      console.log(chalk.red('✖ Nenhuma resposta encontrada que contenha Brainly no link.'));
    }
  });
}

console.clear();

// Criamos uma array com as perguntas que já foram pesquisadas
const linksPesquisados: string[] = [];

printAsciiLogo();
console.log(chalk.green('🔥 Ouvindo por alterações no clipboard.'));

// Começamos o loop a cada 0.2s
setInterval(() => {
  const text = clipboardy.readSync();
  if (text) {
    console.log(chalk.green(`❔ Pergunta: ${text}`));

    if (linksPesquisados.includes(text)) {
      console.log(chalk.red('✖ Essa pergunta já foi respondida, se deseja que ela seja respondida novamente, reinicie a aplicação.'));
    }

    clipboardy.writeSync('');

    try {
      // eslint-disable-next-line prefer-destructuring
      if (!linksPesquisados.includes(text)) {
        linksPesquisados.push(text);
        openAnswerInBrowser(text);
      }
    } catch (err) {
      if (err) throw err;
    }
  }
}, 200);
