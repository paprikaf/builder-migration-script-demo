const axios = require('axios');
const scoreJson = require('./score.json')

const categoryNameMap: any = {
  MIDIA_BLOCK: 'MidiaBlock',
  TEXT_BLOCK: 'TextBlock',
  CTA: 'Cta',
  HERO_PRODUCT: 'HeroProduct'
}

async function postData(body: any) {
  const res = await axios({
    method: 'post',
    url: `https://builder.io/api/v1/write/${MODEL_NAME}`,
    headers: {
      'Authorization': 'Your private space key goes here',
      'Content-Type': 'application/json',
    },
    data: body,
  });

  return res;
}


const MODEL_NAME = 'blog-page'

async function main() {
  console.log('starting...', scoreJson.title)
  const blocks = <any>[]

  scoreJson?.body?.map((layoutItem: any) => {
    let options: any = {
      category: layoutItem.acf_fc_layout,
      title: layoutItem.props.title?.text,
      titleTag: layoutItem.props.title?.tag,
      subtitle: layoutItem.props.subtitle?.text,
      subtitleTag: layoutItem.props.subtitle?.tag,
    }

    if (layoutItem.acf_fc_layout === 'MIDIA_BLOCK') {
      options = {
        ...options,
        type: layoutItem.props.type,
        image: layoutItem.props.image,
        video: layoutItem.props.video,
        position: layoutItem.props.position,
        content: layoutItem.props.content,
        hasButton: layoutItem.props.hasButton,
        button: layoutItem.props.button
      }
    } else if (layoutItem.acf_fc_layout === 'TEXT_BLOCK') {
      options = {
        ...options,
        content: layoutItem.props.content,
      }
    } else if (layoutItem.acf_fc_layout === 'CTA') {
      options = {
       ...options,
        background: layoutItem.props.background,
        button: layoutItem.props.button
     }
    }

    blocks.push({
      "@type": "@builder.io/sdk:Element",
      "@version": 2,
      component: {
        "name": categoryNameMap[layoutItem.acf_fc_layout],
        options,
      }
    })
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
        metaTags: scoreJson.metaTags,
        blocks: blocks,
      }
    }
  )

  console.log('response ', res.status, res.statusText)
  
}


main().catch(err => {
  console.log(err)
})
