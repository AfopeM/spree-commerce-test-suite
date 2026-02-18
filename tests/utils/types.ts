export interface ProductListResponse {
  data: {
    id: string;
    attributes: {
      name: string;
      sku: string;
      price: string;
      in_stock: boolean;
      purchasable: boolean;
    };
    relationships: {
      default_variant: {
        data: { id: string };
      };
    };
  }[];
  meta: {
    total_count: number;
  };
}

export interface CartResponse {
  data: {
    id: string;
    attributes: {
      item_total: string;
      item_count: number;
    };
    relationships: {
      line_items: {
        data: { id: string }[];
      };
    };
  };
}
