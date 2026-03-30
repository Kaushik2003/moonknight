'use client'

interface Props {

    logs: string[]

    contractId: string | null

}

export default function LogsPanel({

    logs,

    contractId

}: Props) {

    return (

        <div className="w-full bg-zinc-100 dark:bg-zinc-900 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto border border-zinc-200 dark:border-zinc-800">

            {logs.length === 0 && (

                <span className="opacity-50">

                    System Logs will appear here...

                </span>

            )}

            {logs.map((log, i) => (

                <div key={i} className="mb-1 break-all">

                    {log}

                </div>

            ))}

            {contractId && (

                <div className="mt-4 p-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded">

                    <strong>Contract ID:</strong> {contractId}

                    <br />

                    <a

                        href={`https://stellar.expert/explorer/testnet/contract/${contractId}`}

                        target="_blank"

                        className="underline"

                    >

                        View on Explorer

                    </a>

                </div>

            )}

        </div>

    )

}