'use client'

export default function Header({

    status

}: {

    status: string

}) {

    return (

        <div>

            <h1 className="text-3xl font-bold">

                Stellar Vide IDE

            </h1>

            <p className="opacity-70">

                Status: {status}

            </p>

        </div>

    )

}