import { toast } from '@zerodevx/svelte-toast';
import type { SvelteComponent } from '@zerodevx/svelte-toast/stores';
import { ethers } from 'ethers';
import { ExecutionStatus, stopProxy, type ProxyAccount, resumeProxy, SupportedChains, EVMHandler, ContractType } from 'xtreamly_sdk';
import type { BackendHandler } from 'xtreamly_sdk/src/backend';

const enum ERC20Contracts {
    USDT,
    USDC
}

export const BACKEND_ADDRESS = 'https://test.xtreamly.io:5002'

type ChainContractAddressMap = Map<ERC20Contracts, string>

const mainnetContractAddrssesMap: ChainContractAddressMap = new Map();

mainnetContractAddrssesMap.set(ERC20Contracts.USDT, '0xdac17f958d2ee523a2206206994597c13d831ec7')
mainnetContractAddrssesMap.set(ERC20Contracts.USDC, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48')

const polygonContractAddressesMap: ChainContractAddressMap = new Map();

polygonContractAddressesMap.set(ERC20Contracts.USDT, '0xc2132D05D31c914a87C6611C10748AEb04B58e8F')
polygonContractAddressesMap.set(ERC20Contracts.USDC, '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174')

export const contractAddressesMap: Map<string, ChainContractAddressMap> = new Map();

contractAddressesMap.set('mainnet', mainnetContractAddrssesMap)
contractAddressesMap.set('matic', polygonContractAddressesMap)


export const nativeCurrenciesNamesMap = new Map<string, string>();

nativeCurrenciesNamesMap.set('matic', 'MATIC')
nativeCurrenciesNamesMap.set('mainnet', 'ETH')

export function showToast(view: SvelteComponent, props: {
    [x: string]: any;
} | undefined) {
    toast.push({
        component: {
            src: view,
            props: props
        },
        initial: 1,
        reversed: true,
        duration: 3000,
        dismissable: false,
        intro: { y: 32 },
    });
}


export function generateRandomAccount() {
    const wallet = ethers.Wallet.createRandom();
    return wallet.address;
}


export async function toggleProxy(backendHandler: BackendHandler, proxy: ProxyAccount | undefined) {
    if (proxy) {
        if (proxy.status === ExecutionStatus.RUNNING) {
            await stopProxy(backendHandler, proxy.uid);
        } else {
            await resumeProxy(backendHandler, proxy.uid);
        }
    }
}

export type NativeBalance = {
    name: string,
    balance: string,
};

export type Balance = {
    coin: string;
    contract: string;
    balance: string;
    delegated: string;
};

export async function getNetworkInfo(evmHandler: EVMHandler) {
    return await evmHandler.detectChain();
}

export async function getNativeBalances(evmHandler: EVMHandler, accounts: string[], chains: SupportedChains[]): Promise<NativeBalance[]> {
    const evmNetworkInfo = await getNetworkInfo(evmHandler);
    const currentChainName = evmNetworkInfo[1] ?? 'Other'
    const balances: NativeBalance[] = [];
    if (accounts.length === 0 || chains.length === 0 || chains.length !== accounts.length) {
        return [];
    }
    for (let i = 0; i < accounts.length; i++) {
        const chain = chains[i];
        const address = accounts[i];
        let balance: NativeBalance | null = null;
        switch (chain) {
            case SupportedChains.EVM:
                balance = {
                    name: nativeCurrenciesNamesMap.get(currentChainName) ?? 'EVM Native',
                    balance:
                        convertEVMToCanonicalBalance(await evmHandler.getNativeBalance(address))
                };
                break;
            case SupportedChains.BITCOIN:
                break;
            case SupportedChains.SOLANA:
                break;
            default:
                break;
        }
        if (balance) {
            balances.push(balance);
        }
    }
    return balances;
}

export async function getContractBalanceAndAllowances(evmHandler: EVMHandler, proxyAddress: string, realAddress: string): Promise<Balance[]> {
    let balances: Balance[] = [];
    const evmNetworkInfo = await getNetworkInfo(evmHandler);
    const currentChainName = evmNetworkInfo[1] ?? 'Other'
    const addressesMap = contractAddressesMap.get(currentChainName)
    if (!addressesMap) {
        return [];
    }
    const thisChainContractAddresses = Array.from(addressesMap.values());
    balances = await getSelectedBalanceAndAllowances(evmHandler, thisChainContractAddresses, proxyAddress, realAddress);
    return balances;
}


export async function getSelectedBalanceAndAllowances(evmHandler: EVMHandler, contractAddresses: string[], proxyAddress: string, realAddress: string): Promise<Balance[]> {
    let balances: Balance[] = [];

    for (let address of contractAddresses) {
        const contract = evmHandler.getContract(ContractType.ERC20, address);
        const symbol = await evmHandler.getERC20Symbol(contract);
        const balance = await evmHandler.getERC20Balance(contract, proxyAddress);
        const delegated = await evmHandler.getERC20Allowance(contract, realAddress, proxyAddress);
        balances = [...balances, { coin: symbol, contract: address, balance: balance.toString(), delegated: delegated.toString() }];

    }

    return balances;
}

function convertEVMToCanonicalBalance(evmBalance: bigint) {
    console.log(evmBalance)
    const canonicalBalance = Number((evmBalance / 1000000000000000n)) / 1000
    console.warn(canonicalBalance)
    return canonicalBalance.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 4})
}

export function summerizeAddress(address: string) {
    return `${address.slice(0, 5)}...${address.slice(-4, -1)}`
}
