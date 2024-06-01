import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { ArrowIosDownOutline } from '@/assets/icons/svg'
import { headersNameCards, headersNameDecks } from '@/common/globalVariables'
import Typography from '@/components/ui/Typography/Typography'
import { Table } from '@/components/ui/table'
import { useQueryParams } from '@/hooks/useQueryParams'
import { CardResponse } from '@/services/cards/cards.types'
import { Deck } from '@/services/decks/deck.types'
import clsx from 'clsx'

import s from './tableComponent.module.scss'

// type Item<T> = T extends Deck[] ? Deck : CardResponse

type Props<T extends CardResponse[] | Deck[]> = {
  children: ReactNode
  data?: T
  isLoading?: boolean
  tableHeader: { key: string; title: string }[]
}

export const TableComponentWithTypes = <T extends CardResponse[] | Deck[]>({
  children,
  data,
  isLoading,
  tableHeader,
}: Props<T>) => {
  const { currentOrderBy, setSortByQuery } = useQueryParams()
  const header = tableHeader === headersNameDecks ? headersNameDecks : headersNameCards
  const { search } = useQueryParams()
  const { t } = useTranslation()

  let message = ''

  if (isLoading) {
    message = 'Please wait, the data is loading'
  } else if (search.length === 0) {
    message = `${t('tableComponentWithTypes.pleaseAddAnyData')}`
  } else {
    message = `${t('tableComponentWithTypes.noContent')}...`
  }

  return (
    <Table.Root className={s.tableRoot}>
      <Table.Head>
        <Table.Row>
          {header.map(name => (
            <Table.HeadCell
              className={clsx(
                tableHeader === headersNameDecks ? s.tableHeadCellDecks : s.tableHeadCellCards
              )}
              key={name.key}
              onClick={() => setSortByQuery(name.key)}
            >
              <Typography as={'button'} className={s.nameSortBtn} variant={'subtitle2'}>
                {/*{name.title}*/}
                {t(`${name.locale}`)}
                {currentOrderBy.includes(name.key) && (
                  <ArrowIosDownOutline
                    className={`${s.arrow} ${currentOrderBy.includes('asc') ? s.rotate : ''}`}
                  />
                )}
              </Typography>
            </Table.HeadCell>
          ))}
          <Table.HeadCell className={s.emptyTableHeadCell}></Table.HeadCell>
        </Table.Row>
      </Table.Head>
      <>
        {data && data?.length !== 0 ? (
          <Table.Body>{children}</Table.Body>
        ) : (
          <Table.Body>
            <Table.Row>
              <Table.Cell className={s.empty} colSpan={header.length + 1}>
                <Typography as={'span'} variant={'body1'}>
                  {message}
                </Typography>
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        )}
      </>
    </Table.Root>
  )
}
