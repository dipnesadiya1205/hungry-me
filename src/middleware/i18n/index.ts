import i18n from 'i18n';
import path from 'path';

i18n.configure({
    defaultLocale: 'en',
    locales: ['en', 'hi', 'gu'],                            // * Array of locales
    directory: path.join(__dirname, '../../../locales'),    // * JSON file location
    autoReload: true,                                       // * Reload locales after change
    objectNotation: true,  
    cookie: 'online_food_order'                             // * Sets a custom cookie name to parse locale settings from
});

export default i18n;
