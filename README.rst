Spotlight
=========
Spotlight streaming image displaying software.


Development
-----------

Installation
~~~~~~~~~~~~
Some systeml dependencies are needed for the server side, here given for Debian:

.. code-block::

  sudo apt-get install libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev libpng-dev
  npm install


Running
~~~~~~~
Run the server and the client.

.. code-block::

  $ npm run server
  $ npm run client  # in another terminal


Now you can navigate to `http://127.0.0.1:8000` and enjoy the visualization.


Linting
~~~~~~~
We use ESLint_ to check code correctness according to the Standard_ codestyle.
Lint from time to time to check that you're not doing too much harm to baby ponies.

.. code-block::

  npm run lint


Testing
~~~~~~~
TBD


Maintaining
~~~~~~~~~~~
Run ncu_ from time to time in order to update to the latest version of your dependencies.


.. code-block::

  ncu -u -a


Deployment
----------
Spotlight runs on a dedicated server named `someserver` (for now)

There's a set of Ansible rules used to set it up and running.

First setup
~~~~~~~~~~~
Add your user to the server.

.. code-block::

  $ ssh root@someserver
  # adduser foobar
  # adduser foobar admin

  $ ssh-copy-id -i ~/.ssh/id_rsa.pub foobar@someserver
  $ ssh foobar@someserver

  # sudo apt update && sudo apt upgrade && sudo reboot

  # #### Improve the sshd connection settings
  # sudo vi /etc/ssh/sshd_config

    PermitRootLogin no
    PasswordAuthentication no

  # #### Python is needed for Ansible
  # sudo apt install python


Provision the server using Ansible
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Install Ansible on your local machine.
 Now you can provision the server with the following:

.. code-block::

  $ ansible-playbook playbook.yml


License
-------
GPL V3

.. _ESLint: http://eslint.org/
.. _ncu: https://github.com/tjunnone/npm-check-updates
.. _Standard: https://standardjs.com/
