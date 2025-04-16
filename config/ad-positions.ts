 // Define standard ad positions throughout the site
export const AD_POSITIONS = {
    // Home page positions
    HOME_HERO: 'home-hero',         // Large banner at top of home page
    HOME_MIDDLE: 'home-middle',      // Medium banner in middle of home page
    HOME_BOTTOM: 'home-bottom',      // Banner near bottom of home page
    HOME_FEATURED: 'home-featured',  // Special featured ad section
    
    // Product listing positions
    PRODUCT_LIST_TOP: 'product-list-top',        // Above product listings
    PRODUCT_LIST_MIDDLE: 'product-list-middle',  // In middle of product listings
    PRODUCT_LIST_BOTTOM: 'product-list-bottom',  // Below product listings
    PRODUCT_IN_LIST: 'product-in-list',          // Looks like a product in the list
    
    // Product detail positions
    PRODUCT_DETAIL_TOP: 'product-detail-top',      // Above product details
    PRODUCT_DETAIL_BOTTOM: 'product-detail-bottom', // Below product details
    PRODUCT_RELATED: 'product-related',            // In related products section
    
    // Sidebar positions
    SIDEBAR_TOP: 'sidebar-top',        // Top of sidebar
    SIDEBAR_MIDDLE: 'sidebar-middle',  // Middle of sidebar
    SIDEBAR_BOTTOM: 'sidebar-bottom',  // Bottom of sidebar
    
    // Other positions
    CATEGORY_HEADER: 'category-header',  // Category page headers
    SEARCH_RESULTS: 'search-results',    // Within search results
    FOOTER: 'footer',                    // Footer ad space
  }
  
  // Recommended dimensions for each position (width x height in pixels)
  export const AD_DIMENSIONS = {
    [AD_POSITIONS.HOME_HERO]: { width: 1200, height: 400, variant: 'banner' },
    [AD_POSITIONS.HOME_MIDDLE]: { width: 800, height: 200, variant: 'banner' },
    [AD_POSITIONS.HOME_BOTTOM]: { width: 800, height: 200, variant: 'banner' },
    [AD_POSITIONS.HOME_FEATURED]: { width: 500, height: 500, variant: 'card' },
    
    [AD_POSITIONS.PRODUCT_LIST_TOP]: { width: 800, height: 200, variant: 'banner' },
    [AD_POSITIONS.PRODUCT_LIST_MIDDLE]: { width: 800, height: 200, variant: 'banner' },
    [AD_POSITIONS.PRODUCT_LIST_BOTTOM]: { width: 800, height: 200, variant: 'banner' },
    [AD_POSITIONS.PRODUCT_IN_LIST]: { width: 300, height: 300, variant: 'card' },
    
    [AD_POSITIONS.PRODUCT_DETAIL_TOP]: { width: 800, height: 200, variant: 'banner' },
    [AD_POSITIONS.PRODUCT_DETAIL_BOTTOM]: { width: 800, height: 200, variant: 'banner' },
    [AD_POSITIONS.PRODUCT_RELATED]: { width: 300, height: 300, variant: 'card' },
    
    [AD_POSITIONS.SIDEBAR_TOP]: { width: 300, height: 250, variant: 'sidebar' },
    [AD_POSITIONS.SIDEBAR_MIDDLE]: { width: 300, height: 600, variant: 'sidebar' },
    [AD_POSITIONS.SIDEBAR_BOTTOM]: { width: 300, height: 250, variant: 'sidebar' },
    
    [AD_POSITIONS.CATEGORY_HEADER]: { width: 800, height: 200, variant: 'banner' },
    [AD_POSITIONS.SEARCH_RESULTS]: { width: 800, height: 100, variant: 'slim' },
    [AD_POSITIONS.FOOTER]: { width: 800, height: 100, variant: 'slim' },
  }
  
  // Helper to get ad dimensions and variant for a position
  export const getAdConfig = (position: string) => {
    return AD_DIMENSIONS[position] || { 
      width: 800, 
      height: 200, 
      variant: 'banner' 
    };
  };