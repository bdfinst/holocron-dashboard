![Holocron Logo](./public/Holocron_logo_color@2x.png)

## Setup Holocron Dashboard

1. Open a terminal, cd into this project and run `npm i`
2. Usually the preferred editor is VSCode, and you can grab VSCode extension
   for ESLint which is the linter we use. However, you are free to code in whichever
   editor you prefer.
3. Happy coding!

## How this project is organized

- All TS files inside `src` are all main level code.
- `__mocks__` are all mocks, functions used to mock server or mock generation.
- `utils` are where all helper utility functions, hooks, components etc. live. Organized the following way:
  - Main code is always at `index.ts/tsx`
  - If a `utils` folder code needs to reference another `utils` folder's code, all code should
    be imported from `index.ts/tsx` of another `utils` folder's code.
  - There cannot be more folders under the folders of the `utils` (no more/no less than depth 1 in
    folder depth.)
- `ui` are where all the components that are directly rendered to the screen live. Organized the following way:
  - Main UI for the component is always at `index.tsx/ts`
  - If a `ui` folder code needs to reference another `ui` folder's code, all code should
    be imported from `index.ts/tsx` of another `ui` folder's code.
  - There cannot be more folders under the folders of the `ui` (no more/no less than depth 1 in
    folder depth.)
- `api` is where all the code related to holocron-api lives. Organized the following way:
  - Everything is imported to `index.ts/tsx`
  - If any file needs to access api code, all code should be imported from `index.ts/tsx` of `api` folder.
  - There cannot be any folders under `api` folder, just `.ts/.tsx` files.
- If you are ever wondering how all the components are connected, `src/ui/Main` will give you all you need on a top down approach.

## Run With Mock Data

- Run `npm start`, and you can go into `http://localhost:3000` to see the front-end.

## Run a Full Stack Environment

Follow the README in the [dev-environment repo](https://repo1.dso.mil/platform-one/big-bang/apps/sandbox/holocron/dev-environment).

## Updating mocks

1. You can update the mocks by going into the `__mocks__` directory, and updating it or generating it with code.
2. Additionally, if you want to add a new endpoint you can add the endpoint in `src/__mocks__/mockServer.js` where
   `miragejs` is being used to host the local server.

## E2E Testing

For running e2e testing in dev-environment, run `npm run cypress:open` or `npm run cypress:run`.

## Update Base Image and Modules

When updating the base image, the modules need to be recompiled as they are no longer included in the ironbank images. Follow these steps:

1. Run an ubuntu image `docker run -it --rm --name=nginx_modules ubuntu /bin/bash` NOTE if running on ARM, then add `--platform=linux/amd64` before the image name.
2. Install needed dependencies into the running container `apt-get update -y && apt-get install wget gcc make libssl-dev libpcre3-dev zlib1g-dev -y`
3. Download the tarball for nginx `wget 'http://nginx.org/download/nginx-<version>.tar.gz'`
4. Unzip it `tar -xzvf nginx-<version>.tar.gz`
5. Enter the new directory `cd nginx-<version>`
6. Download and unzip tarballs for the latest versions of both modules following steps 3 & 4: https://github.com/openresty/set-misc-nginx-module/tags https://github.com/vision5/ngx_devel_kit/tags
7. Configure the nginx installation using the unzipped modules `./configure --prefix=/nginx --with-compat --add-dynamic-module=/path/to/ngx_devel_kit --add-dynamic-module=/path/to/set_misc_nginx_module`
8. Build nginx `make -j2 && make install`
9. From another terminal, outside the container and in this directory, copy out the module files `docker cp nginx_modules:/nginx/modules/ndk_http_module.so ndk_http_module.so` `docker cp nginx_modules:/nginx/modules/ngx_http_set_misc_module.so ngx_http_set_misc_module.so`
10. Update the Dockerfile FROM to the new tag, and build/test the image `docker build . -t test` `docker run --rm test`
