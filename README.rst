Spotlight
=========
Spotlight streaming image displaying software.


Installation
------------
Some systeml dependencies are needed for the server side, here given for Debian:

.. code-block::

  sudo apt-get install libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev libpng-dev
  npm install


Running a development instance
------------------------------
Run the server and the client.

.. code-block::

  $ npm run server
  $ npm run client  # in another terminal


Now you can navigate to `http://127.0.0.1:8000` and enjoy the visualization.


Linting
-------
We use ESLint_ to check code correctness according to the Standard_ codestyle.
Lint from time to time to check that you're not doing too much harm to baby ponies.

.. code-block::

  npm run lint


Maintaining
-----------
Run ncu_ from time to time in order to update to the latest version of your dependencies.


.. code-block::

  ncu -u -a


License
-------
GPL V3

.. _ESLint: http://eslint.org/
.. _ncu: https://github.com/tjunnone/npm-check-updates
.. _Standard: https://standardjs.com/
