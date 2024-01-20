export const defaultSnapOrigin = 'local:http://localhost:8080';

export type GetSnapsResponse = Record<string, Snap>;

export type Snap = {
  permissionName: string;
  id: string;
  version: string;
  initialPermissions: Record<string, unknown>;
};

export type ConnectedSnap = {
    blocked: boolean;
    enabled: boolean;
    id: string;
    version: string;
    initialPermissions: Record<string, unknown>;
}


// TODO: Make sure user has installed Metamask Flask
export class SnapClient {
    connectedSnaps: ConnectedSnap[] = []

    constructor(
    ) {
        if (!window.ethereum) {
            throw Error('Need to have metamask installed');
        }
    }

    connectToSnap = async (
        origin: string = defaultSnapOrigin,
        params: Record<'version' | string, unknown> = {},
    ) => {
        let res = await window.ethereum.request({
            method: 'wallet_requestSnaps',
            params: {
                [origin]: params,
            },
        });
        return res
    };

    getSnaps = async (
    ): Promise<GetSnapsResponse> =>
      (await (window.ethereum).request({
        method: 'wallet_getSnaps',
      })) as unknown as GetSnapsResponse;

    getLocalSnap = async (version?: string): Promise<Snap | undefined> => {
      try {
        const snaps = await this.getSnaps();

        return Object.values(snaps).find(
          (snap) =>
            snap.id === defaultSnapOrigin && (!version || snap.version === version),
        );
      } catch (error) {
        console.log('Failed to obtain installed snap', error);
        return undefined;
      }
    };

    invokeSnap = async (snapOrigin: string, method: string) => {
        let res = await window.ethereum.request({
            method: 'wallet_invokeSnap',
            params: { snapId: snapOrigin, request: { method: method } },
        });
        return res;
    };

    sendHelloToLocal = async() => {
        await this.invokeSnap(defaultSnapOrigin, 'hello')
    }

    isLocalSnap = (snapId: string) => snapId.startsWith('local:');
}
