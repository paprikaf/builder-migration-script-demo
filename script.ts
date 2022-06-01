const axios = require('axios');
const scoreJson = require('./score.json')

async function postData(body: any) {
  const res = await axios({
    method: 'post',
    url: `https://builder.io/api/v1/write/${MODEL_NAME}`,
    headers: {
      'Authorization': 'Bearer bpk-4ba270fe3c7f40cb97e0b7f24e6843b6',
      'Content-Type': 'application/json',
    },
    data: body,
  });

  return res;
}


const MODEL_NAME = 'blog-page'

async function main() {
  console.log('starting...', scoreJson.title)
  const contentBody = <any>[]

  scoreJson?.body?.map((layoutItem: any) => {
    let section: any = {
      category: layoutItem.acf_fc_layout,
      title: layoutItem.props.title?.text,
      titleTag: layoutItem.props.title?.tag,
      subtitle: layoutItem.props.subtitle?.text,
      subtitleTag: layoutItem.props.subtitle?.tag,
    }

    if (layoutItem.acf_fc_layout === 'MIDIA_BLOCK') {
      section = {
        ...section,
        type: layoutItem.props.type,
        image: layoutItem.props.image,
        video: layoutItem.props.video,
        position: layoutItem.props.position,
        content: layoutItem.props.content,
        hasButton: layoutItem.props.hasButton,
        button: layoutItem.props.button
      }
    } else if (layoutItem.acf_fc_layout === 'TEXT_BLOCK') {
      section = {
        ...section,
        content: layoutItem.props.content,
      }
    } else if (layoutItem.acf_fc_layout === 'CTA') {
     section = {
       ...section,
        background: layoutItem.props.background,
        button: layoutItem.props.button
     }
    }

    contentBody.push(section)
  })

  const res = await postData(
    {
      name:  scoreJson.url.replaceAll('/', ''),
      query: [
        {
          "property": "urlPath",
          "operator": "is", // can be `startsWith` to match any urls that starts with value
          "value": scoreJson.url // must start with /
        }
      ],
      data: {
        title: scoreJson.title,
        url: scoreJson.url,
        pageUrl: scoreJson.url,
        target: scoreJson.url,
        metaTags: scoreJson.metaTags,
        content: contentBody,
      }
    }
  )

  console.log('response ', res.status, res.statusText)
  
}


main().catch(err => {
  console.log(err)
})
