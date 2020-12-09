import React, { useContext, useMemo, useState, useCallback, useEffect } from 'react'
import BigNumber from 'bignumber.js'
import { useParams } from 'react-router-dom';

import { TextInput, Button, DataView, useToast, Tag, Header, IconCirclePlus, IconCircleMinus, DropDown, LoadingRing } from '@aragon/ui'
import History from './history'

import { walletContext } from '../../contexts/wallet'
import { Controller } from '../../utils/contracts/controller'
import { getVault, getLiveOTokens } from '../../utils/graph'
import CustomIdentityBadge from '../../components/CustomIdentityBadge'
import Status from '../../components/DataViewStatusEmpty'
import { ZERO_ADDR, tokens } from '../../constants/addresses'
import { useTokenByAddress } from '../../hooks/useToken'
import { toTokenAmount, fromTokenAmount } from '../../utils/math'
import useAsyncMemo from '../../hooks/useAsyncMemo';
import { SubgraphOToken } from '../../types'

export default function VaultDetail() {

  const [vaultExpiry, setVaultExpiry] = useState<string>('0')
  const [isLoading, setIsLoading] = useState(true)

  const [isSendingTx, setIsSendingTx] = useState(false)

  const [changeCollateralAmount, setChangeCollateralAmount] = useState(new BigNumber(0))
  const [changeLongAmount, setChangeLongAmount] = useState(new BigNumber(0))
  const [changeShortAmount, setChangeShortAmount] = useState(new BigNumber(0))

  // for dropdown options
  const [selectedCollateralIndex, setSelectedCollateralIndex] = useState(0)
  const [selectedLong, setLongOToken] = useState<SubgraphOToken | null>(null)
  const [selectedShort, setShortOToken] = useState<SubgraphOToken | null>(null)

  const { web3, networkId, user } = useContext(walletContext)
  const { owner, vaultId } = useParams()
  const toast = useToast()

  const vaultDetail = useAsyncMemo(async () => {
    const result = await getVault(networkId, owner, vaultId, toast)
    setIsLoading(false)
    return result
  }, null, [networkId, owner, toast, vaultId])

  const allOtokens = useAsyncMemo(async () => {
    const result = await getLiveOTokens(networkId, toast)
    return result
  }, [], [networkId, toast])

  /**
   * Use asyncMemo to trigger a rerender when isSendingTx changes.
   */
  const controller = useAsyncMemo(async() => new Controller(web3, networkId, user), new Controller(null, 42, ''),  [networkId, user, web3, isSendingTx])

  const isAuthorized = useMemo(() => {
    if (vaultDetail === null) return false
    else if (owner === user) return true
    else return vaultDetail.owner.operators.map(o => o.operator.id).includes(user)
  }, [vaultDetail, owner, user])

  const collateralToken = useTokenByAddress(vaultDetail && vaultDetail.collateralAsset ? vaultDetail.collateralAsset.id : tokens[networkId][selectedCollateralIndex].address, networkId)

  const shortOtoken = useMemo(() => (vaultDetail && vaultDetail.shortOToken) || selectedShort || null
    , [vaultDetail, selectedShort])

  const longOtoken = useMemo(() => (vaultDetail && vaultDetail.longOToken) || selectedLong || null
    , [vaultDetail, selectedLong])

  useEffect(() => {
    if (shortOtoken) {
      setVaultExpiry(shortOtoken.expiryTimestamp)
      const collateralIdx = tokens[networkId].findIndex(token => token.address === shortOtoken.collateralAsset.id)
      setSelectedCollateralIndex(collateralIdx)
    } else if (longOtoken) {
      setVaultExpiry(longOtoken.expiryTimestamp)
      const collateralIdx = tokens[networkId].findIndex(token => token.address === longOtoken.collateralAsset.id)
      setSelectedCollateralIndex(collateralIdx)
    } else {
      setVaultExpiry('0')

    }
  }, [networkId, shortOtoken, longOtoken, setVaultExpiry])

  // tokens to be shown in dropdown
  const tokensInSelection = useMemo(() => {
    if (!allOtokens) return []
    const sameCollateral = allOtokens.filter(o => o.collateralAsset.id === collateralToken.address || collateralToken.address === ZERO_ADDR)

    const sameExpiry = sameCollateral.filter(o => o.expiryTimestamp === vaultExpiry || vaultExpiry === '0')

    return sameExpiry
  }, [allOtokens, collateralToken, vaultExpiry])

  const pushAddCollateral = useCallback(() => {
    controller.pushAddCollateralArg(user, vaultId, user, collateralToken.address, fromTokenAmount(changeCollateralAmount, collateralToken.decimals))
    setChangeCollateralAmount(new BigNumber(0))
  }, [collateralToken, controller, user, vaultId, changeCollateralAmount])

  const pushRemoveCollateral = useCallback(() => {
    controller.pushRemoveCollateralArg(user, vaultId, user, collateralToken.address, fromTokenAmount(changeCollateralAmount, collateralToken.decimals))
    setChangeCollateralAmount(new BigNumber(0))
  }, [controller, user, vaultId, collateralToken.address, collateralToken.decimals, changeCollateralAmount])

  const pushAddLong = useCallback(() => {
    if (!longOtoken) {
      toast('No long token selected')
      return
    }
    const oToken = vaultDetail && vaultDetail.longOToken ? vaultDetail.longOToken.id : longOtoken.id
    controller.pushAddLongArg(user, vaultId, user, oToken, fromTokenAmount(changeLongAmount, 8))
    setChangeLongAmount(new BigNumber(0))
  }, [toast, vaultDetail, longOtoken, controller, user, vaultId, changeLongAmount])

  const pushRemoveLong = useCallback(() => {
    if (!longOtoken) {
      toast('No long token selected')
      return
    }
    const oToken = vaultDetail && vaultDetail.longOToken ? vaultDetail.longOToken.id : longOtoken.id
    controller.pushRemoveLongArg(user, vaultId, user, oToken, fromTokenAmount(changeLongAmount, 8))
    setChangeLongAmount(new BigNumber(0))
  }, [toast, vaultDetail, longOtoken, controller, user, vaultId, changeLongAmount])

  const pushMint = useCallback(() => {
    if (!shortOtoken) {
      toast('No short token selected')
      return
    }
    const oToken = vaultDetail && vaultDetail.shortOToken ? vaultDetail.shortOToken.id : shortOtoken.id
    controller.pushMintArg(user, vaultId, user, oToken, fromTokenAmount(changeShortAmount, 8))
    setChangeShortAmount(new BigNumber(0))
  }, [toast, vaultDetail, shortOtoken, controller, user, vaultId, changeShortAmount])

  const pushBurn = useCallback(async () => {
    if (!shortOtoken) {
      toast('No short token selected')
      return
    }
    const oToken = vaultDetail && vaultDetail.shortOToken ? vaultDetail.shortOToken.id : shortOtoken.id
    controller.pushBurnArg(user, vaultId, user, oToken, fromTokenAmount(changeShortAmount, 8))
    setChangeShortAmount(new BigNumber(0))
  }, [toast, vaultDetail, shortOtoken, controller, user, vaultId, changeShortAmount])

  const isExpired = useMemo(() => {
    if (!vaultDetail) return false

    if (vaultDetail.shortOToken && Number(vaultDetail.shortOToken.expiryTimestamp) < Date.now() / 1000)
      return true

    if (vaultDetail.longOToken && Number(vaultDetail.longOToken.expiryTimestamp) < Date.now() / 1000)
      return true;

    return false
  }, [vaultDetail])

  const simpleSettle = useCallback(async () => {
    await controller.simpleSettle(user, vaultId, user)
  }, [controller, user, vaultId])

  const renderRow = useCallback(({ label, symbol, asset, amount, decimals, onInputChange, inputValue, onClickAdd, onClickMinus, dropdownSelected, dropdownOnChange, dropdownItems }) => {
    return [
      <div style={{ opacity: 0.8 }}> {label} </div>,
      asset
        ? <CustomIdentityBadge shorten={true} entity={asset} label={symbol} />
        : <DropDown
          items={dropdownItems}
          selected={dropdownSelected}
          onChange={dropdownOnChange}
        />,
      amount
        ? toTokenAmount(new BigNumber(amount), decimals).toString()
        : 0,
      <>
        <TextInput type="number" disabled={isExpired} onChange={onInputChange} value={inputValue} />
        <Button label="Add" disabled={isExpired} display="icon" icon={<IconCirclePlus />} onClick={onClickAdd} />
        <Button label="Remove" disabled={isExpired} display="icon" icon={<IconCircleMinus />} onClick={onClickMinus} />
      </>
    ]
  }, [isExpired])

  return (
    <>
      <Header
        primary={
          <div style={{ fontSize: 26 }}>
            Vault Detail {isAuthorized && <span style={{ paddingBottom: 10 }}><Tag mode="new">My vault</Tag></span>}
          </div>
        }
        secondary={
          isExpired
            ? <Button label="Settle" onClick={simpleSettle} />
            : <Button
              disabled={controller.actions.length === 0 || isSendingTx }
              onClick={() => {
                setIsSendingTx(true)
                controller.operateCache(() => { 
                  setIsSendingTx(false)
                })
              }}
            > Operate {isSendingTx ? <LoadingRing /> : <Tag> {controller.actions.length} </Tag>}  </Button>
        } />
      <DataView
        mode="table"
        status={isLoading ? 'loading' : 'default'}
        fields={['type', 'asset', 'amount', '']}
        statusEmpty={<Status label={"No vaults"} />}
        entries={[
          {
            label: 'Collateral',
            decimals: collateralToken.decimals,
            symbol: collateralToken.symbol,
            asset: vaultDetail?.collateralAsset?.id,
            amount: vaultDetail?.collateralAmount,
            inputValue: changeCollateralAmount,
            onInputChange: (e) => (e.target.value ? setChangeCollateralAmount(new BigNumber(e.target.value))
              : setChangeCollateralAmount(new BigNumber(0))
            ),
            onClickAdd: pushAddCollateral,
            onClickMinus: pushRemoveCollateral,
            dropdownSelected: selectedCollateralIndex,
            dropdownOnChange: setSelectedCollateralIndex,
            dropdownItems: tokens[networkId]?.map(o => o.symbol)
          },
          {
            label: 'Long',
            decimals: 8,
            symbol: vaultDetail?.longOToken?.symbol,
            asset: vaultDetail?.longOToken?.id,
            amount: vaultDetail?.longAmount,
            inputValue: changeLongAmount,
            onInputChange: (e) => (e.target.value ? setChangeLongAmount(new BigNumber(e.target.value))
              : setChangeLongAmount(new BigNumber(0))
            ),
            onClickAdd: pushAddLong,
            onClickMinus: pushRemoveLong,
            dropdownSelected: longOtoken ? tokensInSelection.findIndex(o => o.id === longOtoken.id) : -1,
            dropdownOnChange: (idx: number) => {
              if (idx === -1 || !tokensInSelection[idx]) setLongOToken(null)
              else setLongOToken(tokensInSelection[idx])
            },
            dropdownItems: tokensInSelection.map(o => o.symbol)
          },
          {
            label: 'Short',
            decimals: 8,
            symbol: vaultDetail?.shortOToken?.symbol,
            asset: vaultDetail?.shortOToken?.id,
            amount: vaultDetail?.shortAmount,
            inputValue: changeShortAmount,
            onInputChange: (e) => (e.target.value ? setChangeShortAmount(new BigNumber(e.target.value))
              : setChangeShortAmount(new BigNumber(0))
            ),
            onClickAdd: pushMint,
            onClickMinus: pushBurn,
            dropdownSelected: shortOtoken ? tokensInSelection.findIndex(o => o.id === shortOtoken.id) : -1,
            dropdownOnChange: (idx: number) => {
              if (idx === -1 || !tokensInSelection[idx]) setShortOToken(null)
              else setShortOToken(tokensInSelection[idx])
            },
            dropdownItems: tokensInSelection.map(o => o.symbol)
          }
        ]}
        renderEntry={renderRow}
      />
      <br /><br />
      <History />

    </>
  )
}
