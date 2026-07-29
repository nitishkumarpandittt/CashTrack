// Module-level handle so overlays (e.g. the preloader) can lock scrolling
// without threading the Lenis instance through React context.
let instance = null;

export const setLenis = (value) => {
  instance = value;
};

export const getLenis = () => instance;
