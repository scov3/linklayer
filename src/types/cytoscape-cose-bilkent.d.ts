declare module 'cytoscape-cose-bilkent' {
  import cytoscape from 'cytoscape';

  function register(extension: typeof cytoscape): void;
  export = register;
}
