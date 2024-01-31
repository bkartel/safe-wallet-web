import React, { useCallback, useMemo, useState } from 'react'
import SafeListItem from '@/components/sidebar/SafeListItem'
import useAllOwnedSafes from '@/hooks/useOwnedSafes'
import { Box, Button, IconButton, List, Typography } from '@mui/material'
import css from './styles.module.css'
import ExpandMore from '@mui/icons-material/ExpandMore'
import { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { AppRoutes } from '@/config/routes'
import { useRouter } from 'next/router'
import classNames from 'classnames'
import useConnectWallet from '../ConnectWallet/useConnectWallet'

const maxSafes = 3

const OwnedSafeList = ({ closeDrawer, isWelcomePage }: { closeDrawer?: () => void; isWelcomePage: boolean }) => {
  const [lastChainId, setLastChainId] = useState<string | undefined>()
  const [isListExpanded, setIsListExpanded] = useState<boolean>(false)
  const router = useRouter()
  const connectWallet = useConnectWallet()

  const [safes] = useAllOwnedSafes(isListExpanded ? Infinity : maxSafes, lastChainId)

  const isSingleTxPage = router.pathname === AppRoutes.transactions.tx

  const safesToShow = useMemo(() => {
    return isListExpanded ? safes : safes.slice(0, maxSafes)
  }, [safes, isListExpanded])

  const onShowMore = useCallback(() => {
    if (safes.length > 0) {
      setLastChainId(safes[safes.length - 1].chain.chainId)
      setIsListExpanded((prev) => !prev)
    }
  }, [safes])

  const getHref = useCallback(
    (chain: ChainInfo, address: string) => {
      return {
        pathname: isWelcomePage ? AppRoutes.home : isSingleTxPage ? AppRoutes.transactions.history : router.pathname,
        query: { ...router.query, safe: `${chain.shortName}:${address}` },
      }
    },
    [isWelcomePage, isSingleTxPage, router.pathname, router.query],
  )

  return (
    <div className={classNames(css.container, { [css.sidebarContainer]: !isWelcomePage })}>
      <div className={css.header}>
        <Typography variant="h5" display="inline" fontWeight={700}>
          My accounts
        </Typography>
      </div>

      {!safes.length && (
        <Box display="flex" flexDirection="column" py={4} sx={{ maxWidth: '250px', margin: 'auto' }}>
          <Typography variant="body2" color="primary.light" textAlign="center" mt={2} mb={2}>
            Connect a wallet to view your Safe Accounts or to create a new one
          </Typography>
          <Button
            onClick={connectWallet}
            disableElevation
            size="small"
            variant="contained"
            sx={{ padding: '12px 24px' }}
          >
            Connect new account
          </Button>
        </Box>
      )}

      {!!safes.length && (
        <List className={css.list}>
          {safesToShow.map(({ safeAddress, chain, fiatBalance }) => {
            const href = getHref(chain, safeAddress)
            return (
              <SafeListItem
                key={chain.chainId + safeAddress}
                address={safeAddress}
                chainId={chain.chainId}
                fiatBalance={fiatBalance}
                closeDrawer={closeDrawer}
                href={href}
                shouldScrollToSafe={false}
                isAdded
                isWelcomePage={isWelcomePage}
              />
            )
          })}
        </List>
      )}

      {!isListExpanded && safes.length > maxSafes && (
        <div className={css.ownedLabelWrapper} onClick={onShowMore}>
          <Typography variant="body2" display="inline" className={css.ownedLabel}>
            More Accounts
            <IconButton disableRipple>
              <ExpandMore />
            </IconButton>
          </Typography>
        </div>
      )}
    </div>
  )
}

export default OwnedSafeList
