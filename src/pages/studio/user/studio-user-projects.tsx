import * as RM from '@rainmaker/ui'
import { startCase } from 'lodash'
import { useEffect, useState } from 'react'
import { style } from 'typestyle'
import {
  BasicModal,
  Box,
  Button,
  CancelButton,
  Color,
  Column,
  Heading2,
  Heading3,
  Icon,
  IconButton,
  IconButtonCircle,
  Label,
  Row,
  TextItem,
  WithMenu,
} from '../../../ui'
import { copyToClipboard } from '../../../utils/helpers'
import type * as Studio from '../studio-types'
import { useCurrentStudioUser } from './studio-user-context'
import { useSidebar } from '../../../SideBar'
import { RawData } from '../../../components/RawData'
import { useAPI } from '../../../utils/fetch-api'
import { useParams } from 'react-router-dom'
import useElementFromRef from '../../../ui/hooks/useElementFromRef'

export const StudioUserProjects = () => {
  const user = useCurrentStudioUser()

  return (
    <Column marginBottom={100} maxWidth={720} gap={4}>
      {user.projects.map((x) => (
        <ProjectItem key={x.id} project={x} />
      ))}
    </Column>
  )
}

const ProjectItem = ({ project }: { project: Studio.Project }) => {
  const { deleteProject, broadcasts } = useCurrentStudioUser()
  const { projectId } = useParams()
  const [isHighlighted, setIsHighlighted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [ref, el] = useElementFromRef<any>()
  const numAssets = project.scenes.reduce((acc, x) => {
    return acc + x.assets.length
  }, 0)
  const iconClass = 'icon-class' + project.id
  const hoverClass = 'hover-class' + project.id

  useEffect(() => {
    setIsOpen(projectId === project.id)
    setIsHighlighted(projectId === project.id)
    window.setTimeout(() => {
      el?.scrollIntoView?.({
        behavior: 'smooth',
      })
    }, 200)
  }, [projectId, el])

  return (
    <Column
      forwardedRef={ref}
      tabIndex={1}
      className={style({
        marginLeft: 1,
        padding: 10,
        $nest: {
          [`&:hover .${iconClass}`]: {
            color: 'white !important',
          },
          [`.${hoverClass}`]: {
            opacity: 0,
            transition: '100ms ease all',
          },
          [`&:hover .${hoverClass}`]: {
            opacity: 1,
          },
          '&:focus-within': {
            background: Color.neutral(900),
          },
        },
        ...(isOpen && {
          [`.${iconClass}`]: {
            color: 'white !important',
          },
          [`.${hoverClass}`]: {
            opacity: 1,
          },
        }),
        ...(isHighlighted && {
          outline: '1px solid ' + Color.lightstream.toString(),
          background: Color.neutral(900),
        }),
      })}
    >
      <Row
        onClick={() => setIsOpen(!isOpen)}
        style={{
          cursor: 'pointer',
        }}
      >
        <Box marginRight={10}>
          <IconButton
            className={iconClass}
            icon={isOpen ? 'ChevronDown' : 'ChevronRight'}
            size={24}
          />
        </Box>
        <Column>
          <Row>
            <Box
              alignItems="center"
              justifyContent="center"
              style={{
                width: 20,
                height: 20,
                borderColor:
                  project.type === 'mixer'
                    ? Color.purple.toString()
                    : Color.lightstream.toString(),
                borderRadius: '50%',
                borderWidth: 2,
                borderStyle: 'solid',
                marginRight: 5,
              }}
              tooltip={
                project.type === 'mixer' ? 'Gamer Project' : 'Creator Project'
              }
            >
              {project.type === 'mixer' ? 'G' : 'C'}
            </Box>
            {project.isAutoLive && (
              <Box
                tooltip="Auto Live"
                marginRight={6}
                alignItems="center"
                justifyContent="center"
                style={{
                  width: 20,
                  height: 20,
                  borderColor: Color.yellow.light,
                  borderRadius: '50%',
                  borderWidth: 2,
                  borderStyle: 'solid',
                  marginRight: 5,
                }}
              >
                <Icon name="faBolt" type="solid" size={14} />
              </Box>
            )}
            <TextItem text={project.title || 'New Project'} bold={true} />
          </Row>
          <Row height={14}>
            <TextItem text={project.id} muted={true} fontSize={10} />
            <IconButton
              className={hoverClass}
              marginLeft={5}
              icon="faCopy"
              onClick={(e) => {
                e.stopPropagation()
                copyToClipboard(project.id)
              }}
              size={16}
            />
          </Row>
        </Column>

        <Row marginLeft="auto">
          <Row justifyContent="flex-end" gap={6}>
            <TextItem text="Broadcasts:" muted={true} />
            <TextItem
              text={
                broadcasts.list.filter((x) => x.projectId === project.id).length
              }
              width={30}
              textAlign="right"
              bold={true}
            />
          </Row>
          <Row justifyContent="flex-end" gap={6}>
            <TextItem text="Scenes:" muted={true} />
            <TextItem
              text={project.scenes.length}
              width={30}
              textAlign="right"
              bold={true}
            />
          </Row>
          <Row justifyContent="flex-end" gap={6}>
            <TextItem text="Layers:" muted={true} />
            <TextItem
              text={numAssets}
              width={30}
              textAlign="right"
              bold={true}
            />
          </Row>
          <Row width={70} gap={6}>
            <Box tooltip="View details">
              <WithMenu
                isOpen={isDetailsOpen}
                position="left"
                onOutsideClick={() => setIsDetailsOpen(false)}
                node={
                  <IconButtonCircle
                    className={hoverClass}
                    colorWeight={600}
                    size={28}
                    icon="faInfo"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsDetailsOpen(!isDetailsOpen)
                    }}
                  />
                }
              >
                <ProjectDetails project={project} />
              </WithMenu>
            </Box>
            <Box tooltip="Delete project">
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
              <Column padding={30} width={260}>
                <Heading3 text="Delete project?" />
                <Column marginTop={20}>
                  <TextItem text={project.title || 'New Project'} />
                  <TextItem marginTop={4} muted={true} text={project.id} />
                </Column>
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
                      deleteProject(project).then(() => {
                        RM.Toasts.success('Project deleted', 3000)
                      })
                    }}
                  />
                </Row>
              </Column>
            </BasicModal>
          </Row>
        </Row>
      </Row>
      {isOpen && (
        <Column
          marginLeft={12}
          marginTop={4}
          marginBottom={8}
          paddingLeft={8}
          paddingTop={6}
          paddingBottom={0}
          style={{
            borderLeft: '1px solid rgba(255,255,255,0.3)',
          }}
        >
          {project.scenes.map((x) => (
            <SceneItem key={x.id} scene={x} />
          ))}
          {project.scenes.length === 0 && (
            <Row padding={6} background="rgba(0,0,0,.1)">
              <TextItem
                text="[EMPTY]"
                opacity={0.3}
                textTransform="uppercase"
              />
            </Row>
          )}
        </Column>
      )}
    </Column>
  )
}

const ProjectDetails = ({ project }: { project: Studio.Project }) => {
  const user = useCurrentStudioUser()
  const getResolution = () => {
    if (project.profile === undefined && user.subscription !== null) {
      let val = user.subscription.planId.match(/\d+/g) // match digits
      return val[0] + 'p' + val[1]
    } else if (project.profile !== undefined) {
      let val = project.profile.match(/\d+/g)
      return val[0] + 'p' + val[1]
    } else return 'n/a'
  }

  return (
    <Column background={Color.neutral(700)} padding={20} width={260} gap={6}>
      <Heading3 text="Project Settings" />
      <Row justifyContent="space-between" marginTop={8}>
        <Label text="Resolution" />
        <TextItem text={getResolution()} />
      </Row>
      <Row justifyContent="space-between">
        <Label text="Auto Live" />
        <TextItem text={String(project.isAutoLive)} />
      </Row>
      <Row justifyContent="space-between">
        <Label text="Quick Scene Switch" />
        <TextItem text={String(project.isQuickSceneSwitchEnabled)} />
      </Row>
      <Row justifyContent="space-between">
        <Label text="Disconnect Protection" />
        <TextItem text={String(project.isDisconnectProtectionEnabled)} />
      </Row>
    </Column>
  )
}

const SceneItem = ({ scene }: { scene: Studio.Scene }) => {
  const { deleteScene } = useCurrentStudioUser()
  const { projectId } = useParams()
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const iconClass = 'icon-class' + scene.id
  const hoverClass = 'hover-class' + scene.id

  useEffect(() => {
    setIsOpen(projectId === scene.owner)
  }, [projectId])

  return (
    <Column
      className={style({
        paddingTop: 6,
        paddingBottom: 6,
        $nest: {
          [`&:hover .${iconClass}`]: {
            color: 'white !important',
          },
          [`.${hoverClass}`]: {
            opacity: 0,
            transition: '100ms ease all',
          },
          [`&:hover .${hoverClass}`]: {
            opacity: 1,
          },
        },
        ...(isOpen && {
          [`.${iconClass}`]: {
            color: 'white !important',
          },
          [`.${hoverClass}`]: {
            opacity: 1,
          },
        }),
      })}
    >
      <Row
        onClick={() => setIsOpen(!isOpen)}
        style={{
          cursor: 'pointer',
        }}
      >
        <Box marginRight={10}>
          <IconButton
            className={iconClass}
            icon={isOpen ? 'ChevronDown' : 'ChevronRight'}
            size={24}
          />
        </Box>
        <Column>
          <Row>
            <TextItem text={scene.title || 'New Scene'} bold={true} />
            <Box marginLeft={6} marginRight={6}>
              <TextItem text="-" opacity={0.4} />
            </Box>
            <TextItem
              fontWeight={300}
              fontSize={10}
              text={scene.assets.length + ' layers'}
            />
          </Row>
          <Row height={14}>
            <TextItem text={scene.id} muted={true} fontSize={10} />
            <IconButton
              className={hoverClass}
              marginLeft={5}
              icon="faCopy"
              onClick={() => copyToClipboard(scene.id)}
              size={16}
            />
          </Row>
        </Column>
        <Row marginLeft="auto">
          <Row width={70} gap={6}>
            <WithMenu
              isOpen={isDetailsOpen}
              position="left"
              onOutsideClick={() => setIsDetailsOpen(false)}
              interactionHandlers={{
                onMouseEnter: () => setIsDetailsOpen(true),
                onMouseLeave: () => setIsDetailsOpen(false),
              }}
              node={
                <IconButton
                  className={hoverClass}
                  colorWeight={600}
                  size={28}
                  icon="faImage"
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                />
              }
            >
              <Box padding={4} background={Color.neutral(700)}>
                <img
                  src={scene.snapshotUrl}
                  style={{
                    width: 400,
                    minHeight: 260,
                  }}
                />
              </Box>
            </WithMenu>
            <Box tooltip="Delete scene">
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
              <Column padding={30} width={260}>
                <Heading3 text="Delete scene?" />
                <Column marginTop={20}>
                  <TextItem text={scene.title || 'New Scene'} />
                  <TextItem marginTop={4} muted={true} text={scene.id} />
                </Column>
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
                      deleteScene(scene).then(() => {
                        RM.Toasts.success('Scene deleted', 3000)
                      })
                    }}
                  />
                </Row>
              </Column>
            </BasicModal>
          </Row>
        </Row>
      </Row>
      {isOpen && (
        <Column
          marginTop={10}
          marginBottom={8}
          paddingLeft={12}
          paddingTop={6}
          paddingBottom={0}
          gap={5}
        >
          {scene.assets.map((x) => (
            <AssetItem key={x.id} asset={x} />
          ))}
          {scene.assets.length === 0 && (
            <Row padding={6} background="rgba(0,0,0,.1)">
              <TextItem
                text="[EMPTY]"
                opacity={0.3}
                textTransform="uppercase"
              />
            </Row>
          )}
        </Column>
      )}
    </Column>
  )
}

const getIsUrl = (url: string) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

const AssetItem = ({ asset }: { asset: Studio.Asset }) => {
  const { deleteAsset } = useCurrentStudioUser()
  const { setSidebar } = useSidebar()
  const isUrl = getIsUrl(asset.content)
  const [isDeleting, setIsDeleting] = useState(false)
  const hoverClass = 'hover-class' + asset.id

  const viewDetails = () => {
    setSidebar({
      header: (
        <Heading2 text={`Asset Details: ${startCase(asset.prettyName)}`} />
      ),
      body: <AssetDetails asset={asset} />,
    })
  }

  return (
    <Row
      className={style({
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
      <Row
        className={style({
          width: '80%',
          padding: 5,
          paddingLeft: 8,
          background: Color.neutral(700),
          cursor: 'pointer',
          $nest: {
            '&:hover': {
              background: Color.neutral(800),
            },
          },
        })}
        onClick={(e) => {
          viewDetails()
        }}
      >
        <Box width={140} flexShrink={0}>
          <TextItem text={startCase(asset.prettyName)} />
        </Box>
        {isUrl && (
          <Box tooltip={asset.content} flexGrow={1} overflow="hidden">
            <TextItem
              text={asset.content}
              href={asset.content}
              target="_blank"
              ellipsis={true}
              fontSize={10}
              opacity={0.7}
            />
          </Box>
        )}
      </Row>
      <Row marginLeft={10}>
        <Row width={70} gap={2}>
          <Box tooltip="View details">
            <IconButton
              className={hoverClass}
              size={18}
              icon="faInfo"
              onClick={(e) => {
                viewDetails()
              }}
            />
          </Box>
          <Box tooltip="Delete layer">
            <IconButton
              className={hoverClass}
              icon="faTrash"
              size={18}
              color="secondary"
              onClick={(e) => {
                setIsDeleting(true)
              }}
            />
          </Box>
          <BasicModal
            showX={true}
            isOpen={isDeleting}
            onClose={() => setIsDeleting(false)}
          >
            <Column padding={30} width={260}>
              <Heading3 text="Delete layer?" />
              <Column marginTop={20}>
                <TextItem text={startCase(asset.prettyName)} />
                <TextItem marginTop={4} muted={true} text={asset.id} />
              </Column>
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
                    deleteAsset(asset).then(() => {
                      RM.Toasts.success('Asset deleted', 3000)
                    })
                  }}
                />
              </Row>
            </Column>
          </BasicModal>
        </Row>
      </Row>
    </Row>
  )
}

const AssetDetails = ({ asset }: { asset: Studio.Asset }) => {
  const isUrl = getIsUrl(asset.content)
  const raw = useAPI(`/api/assets/${asset.id}/raw`)

  return (
    <Column gap={10} paddingRight={10}>
      {isUrl &&
        (asset.name === 'image' ? (
          <img
            src={asset.content}
            width="100%"
            style={{ objectFit: 'contain', maxHeight: 260 }}
          />
        ) : (
          <Box height={300} width="100%" position="relative">
            <Box
              alignItems="center"
              justifyContent="center"
              style={{
                position: 'absolute',
                width: 1920,
                height: 1080,
                transform: 'scale(0.273)',
                transformOrigin: '0 0',
              }}
            >
              <iframe src={asset.content} height="100%" width="100%" />
            </Box>
          </Box>
        ))}
      <Row justifyContent="space-between">
        <Label text="Publish Type" />
        <TextItem text={startCase(asset.publishType)} />
      </Row>
      <Row justifyContent="space-between">
        <Label text="Scene ID" />
        <TextItem text={asset.owner} />
      </Row>
      <Row justifyContent="space-between">
        <Label text="Last Updated" />
        <TextItem text={asset.updatedAt} />
      </Row>
      <Row justifyContent="space-between">
        <Label text="Dimensions" />
        <TextItem text={`${asset.width} x ${asset.height}`} />
      </Row>
      <Column width="100%" overflow="hidden">
        <Label text="Raw data" />
        <RawData data={raw} />
      </Column>
    </Column>
  )
}
