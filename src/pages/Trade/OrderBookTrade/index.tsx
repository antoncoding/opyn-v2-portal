import React, { useState, useEffect } from 'react'
import ReactGA from 'react-ga'
import TradeHeader from './Header'
import Board from './Board'
import MintPanel from './MintPanel'
import Orderbook from './Orderbook'
import TradePanel from './TradePanel'

import { SubgraphOToken } from '../../../types'
import { TradeAction } from '../../../constants'
import { useTokenPrice } from '../../../hooks'
import { emptyToken } from '../../../constants/addresses'

export default function TradePage() {
  useEffect(() => {
    ReactGA.pageview('trade/swap/')
  })
  const [selectedUnderlying, setSelectedUnderlying] = useState(emptyToken)
  const [selectedOToken, setSelectedOToken] = useState<SubgraphOToken | null>(null)
  const [oTokens, setOTokens] = useState<SubgraphOToken[]>([])
  const [action, setAction] = useState<TradeAction>(TradeAction.Buy)

  const [mintPanelOpened, setMintPanelOpened] = useState(false)

  const spotPrice = useTokenPrice(selectedUnderlying.id, 10)

  return (
    <>
      <TradeHeader setOTokens={setOTokens} setSelectedUnderlying={setSelectedUnderlying} />
      <Board
        spotPrice={spotPrice}
        oTokens={oTokens}
        selectedOToken={selectedOToken}
        setSelectedOToken={setSelectedOToken}
      />
      <div style={{ display: 'flex', paddingTop: '15px' }}>
        <div style={{ width: '30%' }}>
          <Orderbook selectedOToken={selectedOToken} setAction={setAction} action={action} />
        </div>
        <div style={{ paddingLeft: '15px', width: '70%' }}>
          <TradePanel selectedOToken={selectedOToken} action={action} setAction={setAction} />
        </div>
      </div>
      <MintPanel oToken={selectedOToken} opened={mintPanelOpened} onClose={() => setMintPanelOpened(false)} />
    </>
  )
}