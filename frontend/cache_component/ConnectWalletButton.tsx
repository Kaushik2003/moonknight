'use client'

import { isConnected, setAllowed, getAddress } from "@stellar/freighter-api"

interface Props {
    walletAddress: string | null
    setWalletAddress: (addr: string) => void
    addLog: (msg: string) => void
}

export default function ConnectWalletButton({
    walletAddress,
    setWalletAddress,
    addLog
}: Props) {

    const handleConnect = async () => {
        try {
            if (!(await isConnected())) {
                alert("Please install Freighter!")
                return
            }

            await setAllowed()

            const { address } = await getAddress()

            setWalletAddress(address)

            addLog(`Wallet Connected: ${address}`)

        } catch (e: any) {

            addLog(`Error connecting: ${e.message}`)

        }
    }

    return (
        <button
            onClick={handleConnect}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-5 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
            {walletAddress ? "Connected" : "Connect Wallet"}
        </button>
    )
}