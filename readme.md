# Splitter Project

Create a smart contract named Splitter whereby:

- there are 3 people: Alice, Bob and Carol.
- we can see the balance of the Splitter contract on the Web page.
- whenever Alice sends ether to the contract for it to be split, half of it goes to Bob and the other half to Carol.
- we can see the balances of Alice, Bob and Carol on the Web page.
- Alice can use the Web page to split her ether.

## Install

```
$ npm install -g truffle ganache-cli
```

## Compile

```
$ truffle compile
```

## Migrate

```
$ truffle migrate
```

## Play with migrated contrac

```
$ truffle console
```

## Test

```
$ truffle test
```

## Run Dapp

On terminal 1

```
$ ganache-cli
```

On terminal 2

```
$ truffle migrate
$ cd dapp
$ ln -s ../build/contracts contracts
$ cd ..
$ php -S 0.0.0.0:8000 -t dapp/
```

Open browser to: http://localhost:8000/
