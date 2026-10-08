// Property keys are snake_case: this is the contract sent to the provider,
// not our naming. A variant of an existing step is a property, not an event.
export type EntityType = 'region' | 'sector' | 'route';

export type CatalogSource =
  | 'card'
  | 'map'
  | 'search'
  | 'topo'
  | 'logbook'
  | 'breadcrumb';

export type LoginMethod = 'google' | 'email';

// Stamped on every event; 'unknown' covers the moment before the session is
// restored, so a guest count never absorbs it.
export type AuthState = 'guest' | 'member' | 'unknown';

export type SignInPromptAction = 'tick' | 'logbook' | 'profile' | 'filter';

export type ContentType = 'tick' | 'comment' | 'media' | 'topo';

export type DialogName =
  | 'tick'
  | 'topo_photo'
  | 'route_media'
  | 'save_offline'
  | 'install_hint';

export type OfflineAction =
  | 'save_started'
  | 'save_completed'
  | 'save_failed'
  | 'refreshed'
  | 'removed';

export type OfflineSource = 'header' | 'profile';

export type AnalyticsEvent =
  | { name: 'Page Viewed'; props: { path: string } }
  | { name: 'Login Attempted'; props: { method: LoginMethod } }
  | { name: 'Logged In'; props: { method: LoginMethod } }
  | { name: 'Signed Up'; props: { method: LoginMethod } }
  | { name: 'Logged Out' }
  | { name: 'Sign In Prompted'; props: { action: SignInPromptAction } }
  | {
      name: 'Catalog Item Opened';
      props: {
        entity_type: EntityType;
        entity_name: string;
        source: CatalogSource;
        id_region: string;
        id_sector?: string;
        id_route?: string;
      };
    }
  | {
      name: 'Search Performed';
      props: {
        term_length: number;
        result_count: number;
        has_results: boolean;
      };
    }
  | {
      name: 'List Controls Used';
      props: {
        list:
          | 'routes'
          | 'route'
          | 'logbook'
          | 'sector'
          | 'region'
          | 'topo_photo';
        control:
          | 'grade_filter'
          | 'grade_filter_reset'
          | 'rating_filter'
          | 'length_filter'
          | 'ascents_filter'
          | 'filters_reset'
          | 'sort'
          | 'sort_direction'
          | 'topo'
          | 'tab'
          | 'discipline'
          | 'ascent_type'
          | 'view'
          | 'filters_toggle'
          | 'zoom'
          | 'conditions_day'
          | 'conditions_expand';
        value: string;
      };
    }
  | { name: 'Dialog Opened'; props: { dialog: DialogName } }
  | { name: 'Dialog Dismissed'; props: { dialog: DialogName } }
  | {
      name: 'Directions Requested';
      props: { entity_type: 'region' | 'sector' };
    }
  | {
      name: 'Tick Logged';
      props: {
        ascent_type: string;
        id_route: string;
        has_note: boolean;
        has_rating: boolean;
        has_partner: boolean;
        has_grade_vote: boolean;
        has_weather: boolean;
        weather_edited: boolean;
        photo_count: number;
        video_count: number;
      };
    }
  | {
      name: 'Content Created';
      props: {
        content_type: ContentType;
        id_route?: string;
        id_sector?: string;
      };
    }
  | { name: 'Content Updated'; props: { content_type: ContentType } }
  | { name: 'Content Deleted'; props: { content_type: ContentType } }
  | {
      name: 'Offline Region Action';
      props: {
        action: OfflineAction;
        id_region: string;
        source: OfflineSource;
        photo_count?: number;
        bytes?: number;
        duration_ms?: number;
        code?: string;
      };
    }
  | {
      name: 'Weather Load Failed';
      props: {
        context: 'conditions' | 'tick';
        code: string;
        provider: string;
      };
    }
  | {
      name: 'QR Code Scanned';
      props: {
        result: 'opened' | 'not_found';
        qr_path: string;
        id_region?: string;
        id_sector?: string;
        region_name?: string;
        sector_name?: string;
      };
    }
  | { name: 'App Installed'; props: { platform: string } }
  | {
      name: 'Setting Changed';
      props: {
        setting:
          | 'locale'
          | 'theme'
          | 'grade_scale_route'
          | 'grade_scale_boulder';
        value: string;
      };
    };
