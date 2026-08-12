-- Migration 060: Add ad popup config keys to system_config
INSERT IGNORE INTO system_config (`key`, `value`, `group`, `description`)
VALUES
  ('ad_popup_enabled',     'false',           'branding', 'Enable or disable the promotional popup ad on the public site'),
  ('ad_popup_image',       '',                'branding', 'Path or URL for the popup ad banner image'),
  ('ad_popup_link',        '/#courses',       'branding', 'URL users are redirected to when they click the popup ad button'),
  ('ad_popup_button_text', 'Claim Offer Now', 'branding', 'Label text for the popup ad call-to-action button');
