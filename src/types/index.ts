export interface Event {
  id: number;
  event_name: string;
  organization_name: string;
  start_datetime: string;
  end_datetime: string;
  address: string;
  event_link: string;
  maps_link: string;
  online: boolean;
  status: "approved" | "declined" | "requested";
  tags: string[];
  intl: {
    "pt-br": {
      banner_link: string;
      cost: string;
      event_edition: string;
      short_description: string;
    };
    "en-us": {
      banner_link: string;
      cost: string;
      event_edition: string;
      short_description: string;
    };
  };
}

export interface AuthContextType {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}
