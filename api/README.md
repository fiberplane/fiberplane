
## Running mizu

```sh
npm install

# NOTE - Before running db migrations, you need to follow the instructions in `Configuring Neon (the Database)`

npm run db:generate
npm run db:migrate

# NOTE - This app runs Hono in a Node.js execution context by default,
#        Since we need access to the filesystem to do fun stuff
npm run dev 
```


### Adding some AI

- Get an OpenAI API Key
- Add it to `.dev.vars`
- Voilà

## Publishing

### Testing npx command locally

```sh
cd api
npm run build
npm link

cd ../some/other/dir
npx mizu studio

# to unlink afterwards
npm ls -g --depth=0 --link=true
npm unlink $NAME_OF_PACKAGE -g
```

### Officially publishing

```sh
# from project root
rm -r api/dist/*
mkdir api/dist

cd frontend
npm run build
cp -r dist/* ../api/dist/

cd ../api
npm run build

npm publish
```