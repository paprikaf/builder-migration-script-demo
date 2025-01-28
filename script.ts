const axios = require('axios');
const newContent = require('./newContent.json');

const MODEL_NAME = 'bizzkit-data' // Changed to indicate this is a data model
const PRIVATE_API_KEY = 'bpk-xxxxxxxxxxxxx' 

async function postData(body: any) {
  const res = await axios({
    method: 'post',
    url: `https://builder.io/api/v1/write/${MODEL_NAME}`,
    headers: {
      'Authorization': `Bearer ${PRIVATE_API_KEY}`,  // Add 'Bearer' prefix
      'Content-Type': 'application/json',
    },
    data: body,
  });

  return res;
}

function cleanObject(obj: any) {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v != null)
  );
}

async function main() {
  // Debug logging
  console.log('Content structure:', {
    hasResponse: !!newContent?.response,
    hasFrontendContent: !!newContent?.response?.frontendContent,
    hasMenuInfo: !!newContent?.response?.frontendContent?.cmsArticleMenuInfo,
  });

  // Safely transform data with null checks
  const transformedData = {
    header: {
      breadcrumbs: newContent?.response?.frontendContent?.cmsArticleMenuInfo?.cmsBreadcrumbs?.map((crumb: any) => ({
        url: crumb.link,
        text: crumb.text
      })) || [],
      navigation: newContent?.response?.frontendContent?.cmsArticleMenuInfo?.menuTrees || []
    },

    siteSettings: {
      clickAndCollect: newContent?.response?.frontendContent?.clickAndCollectedEnabled || false,
      powerstep: newContent?.response?.frontendContent?.powerstepEnabled || false,
      useDaellsSkin: newContent?.response?.frontendContent?.useDaellsSkin || false,
      favoritesCount: newContent?.response?.frontendContent?.favoritesCount || 0
    },

    navigation: {
      staticLinks: newContent?.response?.frontendContent?.staticLinks?.map((link: any) => ({
        url: link.url,
        text: link.text
      })) || [],
      topBanner: newContent?.response?.frontendContent?.topBannerInfo?.url || null
    },

    content: newContent?.response?.frontendContent?.gridRows?.map((row: any) => ({
      id: row.id,
      order: row.orderNum,
      columns: row.gridColumns?.map((column: any) => ({
        id: column.id,
        width: column.units,
        blocks: column.columnLayers?.flatMap((layer: any) => 
          layer.contentBlockGroups?.flatMap((group: any) =>
            group.contentBlocks?.map((block: any) => {
              if (!block.value?.blockTypeName) {
                console.warn('Block missing type:', block);
                return null;
              }
              return cleanObject({
                type: block.value?.blockTypeName,
                mobileHidden: block.hideOnMobile || false,
                order: block.orderNum || 0,
                url: block.value?.url || null,
                imageUrl: block.value?.cmsBlockImageInfo?.defaultFile || null,
                mobileImageUrl: block.value?.cmsBlockImageInfo?.mobileFile || null,
                alt: block.value?.cmsBlockImageInfo?.thumbnailAlternativeText || null,
                text: block.value?.html || null,
                height: block.value?.heightClass || null,
                categoryId: block.value?.categoryId || null,
                numberOfProducts: block.value?.numberOfProducts || null
              });
            }) || []
          ) || []
        ) || []
      })) || []
    })) || []
  }

  // Debug the transformed data
  console.log('Transformed data structure:', {
    hasHeader: !!transformedData.header,
    hasBreadcrumbs: !!transformedData.header.breadcrumbs,
    breadcrumbsLength: transformedData.header.breadcrumbs.length,
    hasNavigation: !!transformedData.navigation,
    hasContent: !!transformedData.content,
    contentLength: transformedData.content.length
  });

  // Post to Builder.io
  const res = await postData({
    name: 'homepage-data',
    published: "published",
    query: [{
      "property": "urlPath",
      "operator": "is",
      "value": "/"
    }],
    data: transformedData
  })

  console.log('Response status:', res.status)
}

main().catch(err => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    data: err.response?.data
  })
})
