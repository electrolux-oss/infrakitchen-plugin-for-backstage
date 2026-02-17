import { PropsWithChildren, useEffect, useMemo } from 'react';
import { useTheme as useBackstageTheme } from '@material-ui/core/styles';

type PaletteColor = string | undefined;

const resolveMode = (paletteType?: string): 'light' | 'dark' =>
  paletteType === 'dark' ? 'dark' : 'light';

const createOverrideCss = ({
  backgroundPaper,
  dividerColor,
  primaryMain,
  textPrimary,
  textSecondary,
  themeMode,
}: {
  backgroundPaper: PaletteColor;
  dividerColor: PaletteColor;
  primaryMain: PaletteColor;
  textPrimary: PaletteColor;
  textSecondary: PaletteColor;
  themeMode: 'light' | 'dark';
}) => `
  /* Force correct colors for InfraKitchen in dark mode */
  [data-mui-color-scheme="dark"] .MuiTypography-body1,
  [data-mui-color-scheme="dark"] .MuiTypography-body2 {
    color: ${textPrimary};
  }

  [data-mui-color-scheme="dark"] .MuiTypography-body2 {
    opacity: 0.6;
  }

  /* Force correct backgrounds for Cards and Paper in dark mode */
  [data-mui-color-scheme="dark"] .MuiCard-root {
    background-color: ${backgroundPaper};
    color: ${textPrimary};
  }

  /* Add borders to Paper in both light and dark mode */
  .MuiPaper-root {
    border: 1px solid ${
      themeMode === 'dark'
        ? dividerColor ?? 'rgba(255, 255, 255, 0.12)'
        : 'rgba(0, 0, 0, 0.12)'
    };
  }

  [data-mui-color-scheme="dark"] .MuiPaper-root {
    background-color: ${backgroundPaper};
    color: ${textPrimary};
  }

  /* Fix input fields in dark mode */
  [data-mui-color-scheme="dark"] .MuiInputBase-root {
    color: ${textPrimary};
  }

  [data-mui-color-scheme="dark"] .MuiInputLabel-root {
    color: ${textSecondary};
  }

  /* Fix helper text colors in dark mode */
  [data-mui-color-scheme="dark"] .MuiFormHelperText-root {
    color: ${textSecondary};
  }

  /* Fix chip colors in dark mode */
  [data-mui-color-scheme="dark"] .MuiChip-root {
    background-color: rgba(255, 255, 255, 0.08);
    color: ${textPrimary};
    border-color: rgba(255, 255, 255, 0.23);
  }

  [data-mui-color-scheme="dark"] .MuiChip-deleteIcon {
    color: ${textSecondary};
  }

  [data-mui-color-scheme="dark"] .MuiChip-deleteIcon:hover {
    color: ${textPrimary};
  }

  /* Fix dropdown/list item text in dark mode */
  [data-mui-color-scheme="dark"] .MuiMenuItem-root,
  [data-mui-color-scheme="dark"] .MuiListItemButton-root,
  [data-mui-color-scheme="dark"] .MuiListItem-root,
  [data-mui-color-scheme="dark"] .MuiAutocomplete-option,
  [data-mui-color-scheme="dark"] .MuiDataGrid-columnsManagementRow {
    color: ${textPrimary};
  }

  /* Fix input field borders in dark mode */
  [data-mui-color-scheme="dark"] .MuiOutlinedInput-notchedOutline {
    border-color: rgba(255, 255, 255, 0.23);
  }

  [data-mui-color-scheme="dark"] .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline {
    border-color: rgba(255, 255, 255, 0.4);
  }

  [data-mui-color-scheme="dark"] .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
    border-color: ${primaryMain};
  }

  /* Fix icons in dark mode */
  [data-mui-color-scheme="dark"] .MuiAutocomplete-popupIndicator svg,
  [data-mui-color-scheme="dark"] .MuiSelect-icon,
  [data-mui-color-scheme="dark"] .MuiIconButton-root svg,
  [data-mui-color-scheme="dark"] .MuiButton-root svg,
  [data-mui-color-scheme="dark"] .MuiDataGrid-panelWrapper .MuiSvgIcon-root,
  [data-mui-color-scheme="dark"] .MuiDataGrid-panelWrapper svg {
    color: ${textPrimary};
  }

  /* Keep disabled buttons legible in dark mode */
  [data-mui-color-scheme="dark"] .MuiButton-root.Mui-disabled,
  [data-mui-color-scheme="dark"] .MuiIconButton-root.Mui-disabled,
  [data-mui-color-scheme="dark"] .MuiButtonBase-root.Mui-disabled {
    color: ${textSecondary};
    border-color: ${textSecondary};
  }

  /* Keep disabled checkbox labels legible */
  [data-mui-color-scheme="dark"] .MuiFormControlLabel-root.Mui-disabled .MuiFormControlLabel-label,
  [data-mui-color-scheme="dark"] .MuiFormControlLabel-root .Mui-disabled {
    color: ${textSecondary};
  }

  /* Fix checkbox colors in dark mode */
  [data-mui-color-scheme="dark"] .MuiCheckbox-root {
    color: ${textSecondary};
  }

  [data-mui-color-scheme="dark"] .MuiCheckbox-root.Mui-disabled,
  [data-mui-color-scheme="dark"] .MuiCheckbox-root.Mui-disabled .MuiSvgIcon-root {
    color: ${textSecondary};
  }

  [data-mui-color-scheme="dark"] .MuiCheckbox-root.Mui-checked {
    color: ${primaryMain};
  }

  /* Fix DataGrid backgrounds in dark mode */
  [data-mui-color-scheme="dark"] .MuiDataGrid-root {
    background-color: ${backgroundPaper};
    color: ${textPrimary};
    border-color: rgba(255, 255, 255, 0.12);
  }

  [data-mui-color-scheme="dark"] .MuiDataGrid-columnHeaders,
  [data-mui-color-scheme="dark"] .MuiDataGrid-columnHeader,
  [data-mui-color-scheme="dark"] .MuiDataGrid-row,
  [data-mui-color-scheme="dark"] .MuiDataGrid-cell,
  [data-mui-color-scheme="dark"] .MuiDataGrid-footerContainer,
  [data-mui-color-scheme="dark"] .MuiDataGrid-columnsManagementHeader,
  [data-mui-color-scheme="dark"] .MuiDataGrid-panelWrapper {
    background-color: ${backgroundPaper};
    color: ${textPrimary};
  }

  [data-mui-color-scheme="dark"] .MuiDataGrid-overlay {
    background-color: transparent;
    color: ${textSecondary};
  }

  /* Fix DataGrid sort button background in dark mode */
  [data-mui-color-scheme="dark"] .MuiDataGrid-columnHeader .MuiDataGrid-sortButton {
    background-color: transparent;
  }

  /* Make DataGrid separators transparent in dark mode */
  [data-mui-color-scheme="dark"] .MuiDataGrid-columnSeparator,
  [data-mui-color-scheme="dark"] .MuiDataGrid-iconSeparator {
    color: transparent;
  }

  [data-mui-color-scheme="dark"] .MuiDataGrid-withBorderColor {
    border-color: transparent;
  }

  /* Fix pagination text colors in dark mode */
  [data-mui-color-scheme="dark"] .MuiTablePagination-selectLabel,
  [data-mui-color-scheme="dark"] .MuiTablePagination-displayedRows {
    color: ${textSecondary};
  }
`;

export const InfraKitchenColorOverrideProvider = ({
  children,
}: PropsWithChildren<{}>) => {
  const backstageTheme = useBackstageTheme();
  const palette = backstageTheme?.palette ?? {};
  const paletteType = (palette as any)?.type ?? (palette as any)?.mode;
  const themeMode = resolveMode(paletteType);

  const textPrimary = palette?.text?.primary ?? '#f7f9fc';
  const textSecondary = palette?.text?.secondary ?? 'rgba(255, 255, 255, 0.6)';
  const backgroundPaper = palette?.background?.paper ?? '#0b1220';
  const dividerColor = palette?.divider;
  const primaryMain = palette?.primary?.main ?? '#4e9bff';

  const overrideCss = useMemo(
    () =>
      createOverrideCss({
        backgroundPaper,
        dividerColor,
        primaryMain,
        textPrimary,
        textSecondary,
        themeMode,
      }),
    [
      backgroundPaper,
      dividerColor,
      primaryMain,
      textPrimary,
      textSecondary,
      themeMode,
    ],
  );

  useEffect(() => {
    const body = document.body;
    const noopCleanup = () => {};

    if (!body) {
      return noopCleanup;
    }

    const previousIk = body.getAttribute('data-ik-color-scheme');
    const previousMui = body.getAttribute('data-mui-color-scheme');

    body.setAttribute('data-ik-color-scheme', themeMode);
    body.setAttribute('data-mui-color-scheme', themeMode);

    return () => {
      if (previousIk) {
        body.setAttribute('data-ik-color-scheme', previousIk);
      } else {
        body.removeAttribute('data-ik-color-scheme');
      }

      if (previousMui) {
        body.setAttribute('data-mui-color-scheme', previousMui);
      } else {
        body.removeAttribute('data-mui-color-scheme');
      }
    };
  }, [themeMode]);

  return (
    <div
      data-mui-color-scheme={themeMode}
      data-ik-color-scheme={themeMode}
      style={{ display: 'contents' }}
    >
      <style>{overrideCss}</style>
      {children}
    </div>
  );
};
