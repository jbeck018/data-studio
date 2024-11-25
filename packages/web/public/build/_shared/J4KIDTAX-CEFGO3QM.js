import {
  Devtools,
  PiPProvider,
  QueryDevtoolsContext,
  THEME_PREFERENCE,
  ThemeContext,
  createLocalStorage
} from "/build/_shared/chunk-F2GZ6KY3.js";
import {
  createComponent,
  createMemo,
  getPreferredColorScheme
} from "/build/_shared/chunk-2ITZUYVB.js";
import "/build/_shared/chunk-PNG5AS42.js";

// ../../node_modules/.pnpm/@tanstack+query-devtools@5.61.3/node_modules/@tanstack/query-devtools/build/DevtoolsComponent/J4KIDTAX.js
var DevtoolsComponent = (props) => {
  const [localStore, setLocalStore] = createLocalStorage({
    prefix: "TanstackQueryDevtools"
  });
  const colorScheme = getPreferredColorScheme();
  const theme = createMemo(() => {
    const preference = localStore.theme_preference || THEME_PREFERENCE;
    if (preference !== "system")
      return preference;
    return colorScheme();
  });
  return createComponent(QueryDevtoolsContext.Provider, {
    value: props,
    get children() {
      return createComponent(PiPProvider, {
        localStore,
        setLocalStore,
        get children() {
          return createComponent(ThemeContext.Provider, {
            value: theme,
            get children() {
              return createComponent(Devtools, {
                localStore,
                setLocalStore
              });
            }
          });
        }
      });
    }
  });
};
var DevtoolsComponent_default = DevtoolsComponent;
export {
  DevtoolsComponent_default as default
};
//# sourceMappingURL=/build/_shared/J4KIDTAX-CEFGO3QM.js.map
