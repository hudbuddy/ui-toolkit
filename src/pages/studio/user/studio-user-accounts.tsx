import * as RM from '@rainmaker/ui'
import { useState } from 'react'
import { style } from 'typestyle'
import { useSidebar } from '../../../SideBar'
import { RawData } from '../../../components/RawData'
import {
  BasicModal,
  Box,
  BrandBubble,
  Button,
  CancelButton,
  Column,
  Heading2,
  Heading3,
  IconButton,
  IconButtonCircle,
  Row,
  TextItem,
} from '../../../ui'
import { copyToClipboard } from '../../../utils/helpers'
import type * as Studio from '../studio-types'
import { useCurrentStudioUser } from './studio-user-context'

export const StudioUserAccounts = () => {
  const user = useCurrentStudioUser()

  return (
    <Column maxWidth={720}>
      {user.accounts.map((x) => (
        <AccountItem key={x.id} account={x} />
      ))}
    </Column>
  )
}

const getChannelUrl = (account: Studio.Account) => {
  if (account.type === 'twitchtv') {
    return `https://www.twitch.tv/${account.username}`
  }
}

const getPlatformId = (account: Studio.Account) => {
  // Filter non-authenticated accounts
  if (account.username) {
    return account.providerId
  }
}

const AccountItem = ({ account }: { account: Studio.Account }) => {
  const { deleteAccount } = useCurrentStudioUser()
  const [isDeleting, setIsDeleting] = useState(false)
  const hoverClass = 'hover-class' + account.id
  const channelUrl = getChannelUrl(account)
  const platformId = getPlatformId(account)
  const { setSidebar } = useSidebar()

  const viewDetails = () => {
    setSidebar({
      header: <Heading2 text={`Account Data`} />,
      body: <RawData data={account.rawJSON} />,
    })
  }

  return (
    <Row
      className={style({
        padding: 10,
        $nest: {
          [`.${hoverClass}`]: {
            opacity: 0,
            transition: '100ms ease all',
          },
          [`&:hover .${hoverClass}`]: {
            opacity: 1,
          },
        },
      })}
    >
      <BrandBubble name={account.type} />
      <Column marginLeft={10} width={200}>
        <Row>
          <TextItem text={account.username} bold={true} />
        </Row>
        <Row height={14}>
          <TextItem text={account.id} muted={true} fontSize={10} />
          <IconButton
            className={hoverClass}
            marginLeft={5}
            icon="faCopy"
            onClick={(e) => {
              e.stopPropagation()
              copyToClipboard(account.id)
            }}
            size={16}
          />
        </Row>
      </Column>
      {platformId && (
        <Row justifyContent="flex-end" gap={6}>
          <TextItem text="Platform ID:" muted={true} fontSize={11} />
          <TextItem text={account.providerId} textAlign="right" fontSize={11} />
        </Row>
      )}
      <Row marginLeft="auto" gap={6}>
        {channelUrl && (
          <Box tooltip="View channel" href={channelUrl} target="_blank">
            <IconButtonCircle
              className={hoverClass}
              marginLeft={5}
              size={28}
              icon="faExternalLink"
              onClick={(e) => {
                e.stopPropagation()
              }}
            />
          </Box>
        )}
        <Box tooltip="View details">
          <IconButtonCircle
            className={hoverClass}
            size={28}
            icon="faInfo"
            onClick={(e) => {
              e.stopPropagation()
              viewDetails()
            }}
          />
        </Box>
        <Box tooltip="Delete account">
          <IconButtonCircle
            className={hoverClass}
            icon="faTrash"
            size={28}
            color="secondary"
            colorWeight={500}
            onClick={(e) => {
              e.stopPropagation()
              setIsDeleting(true)
            }}
          />
        </Box>
        <BasicModal
          showX={true}
          isOpen={isDeleting}
          onClose={() => setIsDeleting(false)}
        >
          <Column padding={30} width={290}>
            <Heading3 text="Delete account?" />
            <Row marginTop={20}>
              <BrandBubble name={account.type} marginRight={10} />
              <Column>
                <TextItem text={account.username} />
                <TextItem marginTop={4} muted={true} text={account.id} />
              </Column>
            </Row>
            <Row gap={8} marginTop={20} justifyContent="flex-end">
              <CancelButton
                onClick={() => {
                  setIsDeleting(false)
                }}
              />
              <Button
                text="Delete"
                color="secondary"
                onClick={() => {
                  setIsDeleting(false)
                  deleteAccount(account).then(() => {
                    RM.Toasts.success('Account deleted', 3000)
                  })
                }}
              />
            </Row>
          </Column>
        </BasicModal>
      </Row>
    </Row>
  )
}
