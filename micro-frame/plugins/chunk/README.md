# chunk

### parts of a page load

````html
<html>
    <head>
      <!-- dont use <link rel="stylesheet" /> as it will block rendering -->
      <link rel="prefetch" href="./below-the-fold.css" />
      <link rel="modulepreload" href="./start-hydration.js" />
      <style>
        /* inlined styles for hero */
      </style>
    </head>
    <body>
    <!-- above the fold -->
    <header>
      <!-- hero -->
    </header>
    <!-- below the fold -->
    <link rel="stylesheet" href="./below-the-fold.css"/>
    <script type="module" src="./start-hydration.js"></script><x-slider>
    <article>
      <!-- .... -->
    </article>
    <footer>
      <!-- .... -->
    </footer>
  </body>
</html>
````
