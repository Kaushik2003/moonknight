'use client'

import { io } from "socket.io-client"

const API_URL = "http://localhost:3000"

const RUST_CODE = `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, vec, Env, Symbol, Vec};

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    pub fn hello(env: Env, to: Symbol) -> Vec<Symbol> {
        vec![&env, symbol_short!("Hello"), to]
    }
}
`

interface Props {
    setStatus: (s: string) => void
    setLogs: React.Dispatch<React.SetStateAction<string[]>>
    setWasmHex: (w: string) => void
}

export default function CompileButton({
    setStatus,
    setLogs,
    setWasmHex
}: Props) {

    const addLog = (msg: string) =>
        setLogs(prev => [...prev, `> ${msg}`])

    const handleCompile = async () => {

        setStatus("Compiling...")
        setLogs([])

        addLog(`Connecting to Backend: ${API_URL}...`)

        const socket = io(API_URL)

        const submissionId = "web-deploy-" + Date.now()

        socket.on("connect", () => {

            addLog("Socket Connected. Sending Code...")

            socket.emit("compile", {
                code: RUST_CODE,
                submissionId
            })

        })

        socket.on("status", (data: any) => {

            setStatus(data.state)

            addLog(`Backend: ${data.state}`)

        })

        socket.on("result", (data: any) => {

            if (data.success) {

                addLog(`Compilation Success! WASM Size: ${data.wasmHex.length} chars`)

                setWasmHex(data.wasmHex)

                setStatus("Compiled")

            } else {

                addLog(`Compilation Failed: ${data.logs}`)

                setStatus("Error")

            }

            socket.disconnect()

        })

    }

    return (
        <button
            onClick={handleCompile}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-zinc-900 dark:bg-zinc-100 px-5 text-white dark:text-black transition-colors hover:bg-zinc-700 dark:hover:bg-zinc-300"
        >
            Compile Code
        </button>
    )
}