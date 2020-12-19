import axios from 'axios';
import open from 'open';
import cheerio from 'cheerio';
import clipboardy from 'clipboardy';

const headers = {
  'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.101 Safari/537.36',
};

function getRequestUrl(query: string) {
  const baseUrl = `https://www.google.com/search?sxsrf=ALeKk02hgZQm-GEdAwirFIHl6CSgPEOUZg%3A1608338316761&source=hp&ei=jEvdX_3aK_uz5OUPo_yU0AU&q=${query}&oq=${query}&gs_lcp=CgZwc3ktYWIQAzIFCAAQsQMyBQgAELEDMgUIABCxAzIFCAAQsQMyAggAMgIIADICCAAyAggAMgUIABCxAzICCAA6BwgjEOoCECc6BggjECcQEzoECCMQJzoICAAQsQMQgwE6BQguELEDOggIABDHARCvAToLCAAQsQMQxwEQowI6BAgAEEM6CAguELEDEIMBOggIABDHARCjAjoHCAAQsQMQQzoFCAAQywE6BggAEBYQHlCgCFiYGmCDPmgIcAB4AIAB1gGIAaMOkgEGMS4xMS4xmAEAoAEBqgEHZ3dzLXdperABCg&sclient=psy-ab&ved=0ahUKEwj90K-Q59jtAhX7GbkGHSM-BVoQ4dUDCAc&uact=5`;
  return baseUrl;
}

function openAnswerInBrowser(query: string) {
  const uris: string[] = [];

  axios.get(getRequestUrl(query), { headers, maxRedirects: 0 }).then((response) => {
    const pageData = response.data;
    const $ = cheerio.load(pageData);

    $('#rso > div > div:nth-child(1) > div').find('a').each((i, el) => {
      const href = $(el).attr('href');
      if (href?.includes('brainly')) {
        uris.push(href);
      }
    });

    if (uris.length !== 0) {
      console.log('\n\nLinks encontrados:');

      uris.forEach((uri) => {
        console.log(uri);
      });

      open(uris[0]);
    } else {
      console.log('Nenhuma resposta encontrada que contenha Brainly no link.');
    }
  });
}

// Criamos uma array com as perguntas que já foram pesquisadas
const linksPesquisados: string[] = [];

console.log('Ouvindo por alterações no clipboard.');

// Começamos o loop a cada 0.2s
setInterval(() => {
  let text = clipboardy.readSync();
  if (text) {
    console.log(`\n\nPergunta: ${text}`);

    clipboardy.writeSync('');

    try {
      [text] = text.split('\n');
      if (!linksPesquisados.includes(text)) {
        openAnswerInBrowser(text);
        linksPesquisados.push(text);
      }
    } catch (err) {
      console.log('Error');
    }
  }
}, 200);
