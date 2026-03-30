'use client'

import { signTransaction } from "@stellar/freighter-api"
import * as StellarSdk from "@stellar/stellar-sdk"
import { Buffer } from "buffer"

const TESTNET_RPC = "https://soroban-testnet.stellar.org"

const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET

interface Props {

    walletAddress: string | null

    wasmHex: string | null

    setStatus: (s: string) => void

    setContractId: (id: string) => void

    addLog: (msg: string) => void

}

export default function DeployButton({

    walletAddress,

    wasmHex,

    setStatus,

    setContractId,

    addLog

}: Props) {

    const handleDeploy = async () => {

        if (!walletAddress || !wasmHex) {

            alert("Connect Wallet and Compile Code first!")

            return

        }

        const server = new StellarSdk.rpc.Server(TESTNET_RPC)

        setStatus("Deploying...")

        try {

            addLog("Preparing Upload Transaction...")

            const account = await server.getAccount(walletAddress)

            const wasmBuffer = Buffer.from(wasmHex, "hex")

            const uploadOp = StellarSdk.Operation.uploadContractWasm({

                wasm: wasmBuffer

            })

            const uploadTx = new StellarSdk.TransactionBuilder(account, {

                fee: StellarSdk.BASE_FEE,

                networkPassphrase: NETWORK_PASSPHRASE

            })

                .addOperation(uploadOp)

                .setTimeout(30)

                .build()

            const preparedUploadTx = await server.prepareTransaction(uploadTx)

            addLog("Please Sign Upload Transaction in Freighter...")

            const signedUploadXdr = await signTransaction(

                preparedUploadTx.toXDR(),

                {

                    networkPassphrase: NETWORK_PASSPHRASE

                }

            )

            if (signedUploadXdr.error)

                throw new Error(signedUploadXdr.error)

            addLog("Submitting Upload...")

            const uploadResult = await server.sendTransaction(

                StellarSdk.TransactionBuilder.fromXDR(

                    signedUploadXdr.signedTxXdr,

                    NETWORK_PASSPHRASE

                )

            )

            const uploadHash = uploadResult.hash

            setContractId(uploadHash)

            addLog(`Upload Tx Hash: ${uploadHash}`)

            setStatus("Deployed!")

        } catch (e: any) {

            setStatus("Error")

            addLog(`Error: ${e.message}`)

        }

    }

    return (

        <button

            onClick={handleDeploy}

            disabled={!wasmHex || !walletAddress}

            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-green-600 px-5 text-white transition-colors hover:bg-green-700 disabled:opacity-50 disabled:bg-gray-400"

        >

            Deploy

        </button>

    )

}