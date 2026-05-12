# Localization

Localization defines the country selector data source and the supported system languages.

Dummy data, such as stories, laws, polls, votes, messages, offices, and profile content, should not be translated. Only navigation labels, form labels, controls, and fixed interface text should follow the selected language.

## Country Schema

Countries are stored in `src/data/countries.json`.

```ts
{
  name: string;
  code: string; // ISO 3166-1 alpha-2
  flagIcon: string;
}
```

The country selector in the navigation uses this JSON file as its data source.

## Language Schema

Supported languages are stored in `src/data/languages.json`.

Languages are not associated with countries.

```ts
{
  name: string;
  nativeName: string;
  code: "en" | "fr" | "ar" | "zh";
  direction: "ltr" | "rtl";
}
```

Supported languages:

- English
- French
- Arabic
- Mandarin

## Interface Requirements

- Navigation labels should follow the selected language.
- Form labels should follow the selected language.
- Hardcoded UI labels and controls should follow the selected language where practical.
- Dummy content should stay in its original language.
- The selected country should update the country icon/control in the navigation.
- The selected language should update the language control in the navigation.
- Store selection locally in the browser until a user profile or backend preference exists.

## Future Integration Notes

- Country selection can later influence country-specific content feeds.
- Language selection can later be stored in Firebase user preferences.
- Translation dictionaries can later be split by namespace and loaded dynamically.
