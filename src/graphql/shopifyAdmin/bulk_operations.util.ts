export function buildCategoryQueryString(
  categoryId: string,
  withPublicationStatus: boolean,
) {
  return `
    {
      collection(id: "${categoryId}") {
        id
        ${withPublicationStatus ? "publishedOnCurrentPublication" : ""}
        products {
            edges {
                node {
                    id
                    status
                    ${
                      withPublicationStatus
                        ? "publishedOnCurrentPublication"
                        : ""
                    }
                    storefrontId
                    title
                    descriptionHtml
                    handle
                    productType
                    featuredImage {
                        url
                        id
                    }
                    images {
                      edges {
                        node {
                          id
                          url 
                        }
                      }
                    }
                    metafields {
                        edges {
                            node { 
                                id
                                namespace
                                key
                                value
                                description
                                createdAt
                                updatedAt
                            }
                        }
                    }
                    tags
                    vendor
                    totalVariants
                    updatedAt
                    variants {
                        edges {
                            node {
                                id
                                title
                                image {
                                    id
                                    url
                                }
                                price
                                sku
                                compareAtPrice
                                availableForSale
                                sellableOnlineQuantity
                                selectedOptions {
                                    name
                                    value
                                }
                            }
                        }
                    }
                }
            }
        }
      }
    }
    `;
}

export function buildCategoriesQueryString(withPublicationStatus: boolean) {
  return `
        {
      collections {
        edges {
          node {
            id
            ${withPublicationStatus ? "publishedOnCurrentPublication" : ""}
            title
            handle
            image {
              url
            }
            storefrontId
            products {
              edges {
                node {
                  id
                  featuredImage {
                    url
                    id
                  }
                  images {
                    edges {
                      node {
                        id
                        url 
                      }
                    }
                  }
                  status
                  ${
                    withPublicationStatus ? "publishedOnCurrentPublication" : ""
                  }
                  storefrontId
                  title
                  descriptionHtml
                  handle
                  productType
                  tags
                  vendor
                  totalVariants
                  updatedAt
                  metafields {
                    edges {
                      node {
                        id
                        namespace
                        key
                        value
                        description
                        createdAt
                        updatedAt
                      }
                    }
                  }
                  variants {
                    edges {
                      node {
                        id
                        title
                        image {
                            id
                            url
                        }
                        price
                        sku
                        compareAtPrice
                        availableForSale
                        sellableOnlineQuantity
                        selectedOptions {
                          name
                          value
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    `;
}

export function buildProductsQueryString(
  productIds: string[],
  withPublicationStatus: boolean,
) {
  let queryString = ``;

  if (productIds.length === 0) {
    //We want to return all products in the store
  } else {
    //We want to get specific products, so we need to build the query string
    queryString = productIds
      .map((productId) => {
        let id = productId;
        if (id.includes("gid://shopify/Product/")) {
          id = id.replace("gid://shopify/Product/", "");
        }
        return `(id:${id})`;
      })
      .join(` OR `);

    queryString = `(first: ${productIds.length}, query: \"${queryString}\")`;
  }

  return `
    {
  products${queryString} {
    edges {
      node {
        id
        featuredImage {
          url
          id
        }
        images {
          edges {
            node {
              id
              url
            }
          }
        }
        status
        ${withPublicationStatus ? "publishedOnCurrentPublication" : ""}
        storefrontId
        title
        descriptionHtml
        handle
        productType
        tags
        vendor
        totalVariants
        updatedAt
        metafields {
          edges {
            node {
              id
              namespace
              key
              value
              description
              createdAt
              updatedAt
            }
          }
        }
        variants {
          edges {
            node {
              id
              title
              image {
                id
                url
              }
              price
              sku
              compareAtPrice
              availableForSale
              sellableOnlineQuantity
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }
  }
}
`;
}

export function buildCollectionQueryString(
  collectionIds: string[],
  withPublicationStatus: boolean,
) {
  let queryString = ``;

  if (collectionIds.length === 0) {
    //We want to return all collections in the store
  }
  //We want to get specific collection, so we need to build the query string
  else {
    queryString = collectionIds
      .map((collectionId) => {
        let id = collectionId;
        if (id.includes("gid://shopify/Collection/")) {
          id = id.replace("gid://shopify/Collection/", "");
        }
        return `(id:${id})`;
      })
      .join(` OR `);

    queryString = `(first: ${collectionIds.length}, query: \"${queryString}\")`;
  }

  return `
       {
  collections${queryString}  {
    edges {
      node {
        id
        ${withPublicationStatus ? "publishedOnCurrentPublication" : ""}
        title
        handle
        image {
          url
        }
        storefrontId
        products {
          edges {
            node {
              id
              featuredImage {
                    url
                    id
              }
            }
          }
        }
      }
    }
  }
}`;
}
