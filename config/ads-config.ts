// Create a centralized ad configuration file
export const AD_POSITIONS = {
  HOME_HERO: 'home-hero',
  HOME_MIDDLE: 'home-middle',
  HOME_BOTTOM: 'home-bottom',
  SIDEBAR: 'sidebar',
  PRODUCT_PAGE: 'product-page'
};

export const AD_DIMENSIONS = {
  [AD_POSITIONS.HOME_HERO]: { width: 1200, height: 400 },
  [AD_POSITIONS.HOME_MIDDLE]: { width: 800, height: 200 },
  [AD_POSITIONS.HOME_BOTTOM]: { width: 800, height: 200 },
  [AD_POSITIONS.SIDEBAR]: { width: 300, height: 600 },
  [AD_POSITIONS.PRODUCT_PAGE]: { width: 800, height: 200 }
};

export const getAdDimensions = (position: string) => {
  return AD_DIMENSIONS[position] || { width: 800, height: 200 };
}; 