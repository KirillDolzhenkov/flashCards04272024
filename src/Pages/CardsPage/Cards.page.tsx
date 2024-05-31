import { ChangeEvent, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'

import groupIcon from '@/assets/icons/WhiteSVG/Group 1399.svg'
import groupIconBlack from '@/assets/icons/WhiteSVG/Group 1399Black.svg'
import menuIcon2 from '@/assets/icons/WhiteSVG/edit-2-outline.svg'
import playIcon from '@/assets/icons/WhiteSVG/play-circle-outline.svg'
import menuIcon from '@/assets/icons/WhiteSVG/trash-outline.svg'
import { handleToastInfo } from '@/common/consts/toastVariants'
import { headersNameCards, initCurrentPage, selectOptionPagination } from '@/common/globalVariables'
import { DeleteModal } from '@/components/ModalsForTable/DeleteModal/DeleteModal'
import { ModalAddEditDeck } from '@/components/ModalsForTable/ModalAddEditDeck'
import { ModalAddEditCard } from '@/components/ModalsForTable/ModalEditCard/ModalAddEditCard'
import ModalOnEmpty from '@/components/ModalsForTable/ModalOnEmpty/ModalOnEmpty'
import { SingleRowCard } from '@/components/TableComponent/SingleRowCard/SingleRowCard'
import { TableComponentWithTypes } from '@/components/TableComponent/TableComponentWithTypes'
import { BackBtn } from '@/components/ui/BackBtn/BackBtn'
import DropdownMenuDemo from '@/components/ui/DropDown/DropDown'
import DropDownItem from '@/components/ui/DropDown/DropDownItem'
import Input from '@/components/ui/Input/Input'
import { LoadingBar } from '@/components/ui/LoadingBar/LoadingBar'
import { Page } from '@/components/ui/Page/Page'
import { PaginationWithSelect } from '@/components/ui/Pagination/PaginationWithSelect'
import Typography from '@/components/ui/Typography/Typography'
import { Button } from '@/components/ui/button'
import { UserContext } from '@/components/ui/changeTheme/Context'
import { useQueryParams } from '@/hooks/useQueryParams'
import { path } from '@/router/path'
import { router } from '@/router/router'
import { useMeQuery } from '@/services/auth/auth.service'
import { useGetCardsQuery } from '@/services/cards/cards.service'
import { useDeleteDeckMutation, useGetDeckByIdQuery } from '@/services/decks/decks.service'
import { clsx } from 'clsx'

import s from './cardsPage.module.scss'

export const CardsPage = () => {
  const context = useContext(UserContext)
  const { t } = useTranslation()
  const {
    currentOrderBy,
    currentPage,
    debouncedSearchValue,
    itemsPerPage,
    search,
    setCurrentPageQuery,
    setItemsPerPageQuery,
    setSearchQuery,
  } = useQueryParams()

  const [open, setOpen] = useState(false)

  const { deckId = '' } = useParams()
  const { data: meData } = useMeQuery()
  const {
    currentData: currentDeckData,
    data: deck,
    isLoading: isDeckLoading,
  } = useGetDeckByIdQuery({ id: deckId })

  const { currentData, data, isFetching, isLoading } = useGetCardsQuery({
    args: { currentPage, itemsPerPage, orderBy: currentOrderBy, question: debouncedSearchValue },
    id: deckId ?? '',
  })
  const [openModal, setOpenModal] = useState(false)
  const [openEditDeckModal, setOpenEditDeckModal] = useState(false)
  const [isDeleteModal, setIsDeleteModal] = useState(false)
  const [deleteDeck] = useDeleteDeckMutation()
  const handleItemsPerPageChange = (value: number) => {
    setCurrentPageQuery(Number(initCurrentPage))
    setItemsPerPageQuery(value)
  }

  const handleCurrentPageChange = (value: number) => {
    setCurrentPageQuery(value)
  }

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setCurrentPageQuery(Number(initCurrentPage))
    setSearchQuery(e.currentTarget.value)
  }

  const onDeleteDeckHandler = () => {
    deleteDeck({ id: deckId })
    setIsDeleteModal(true)
    if (deckId) {
      router.navigate(path.decks)
    }
  }

  const cardsData = currentData ?? data

  const isCardsCountFilled = currentDeckData?.cardsCount !== 0

  const isCardsCountZero =
    currentDeckData?.cardsCount === 0 &&
    deck?.cardsCount === 0 &&
    currentData?.items?.length === 0 &&
    data?.items?.length === 0

  const isMineCards = currentDeckData?.userId === meData?.id

  const handleOpenModal = () => {
    if (
      (isMineCards && isCardsCountZero) ||
      (isMineCards && cardsData?.items?.length === 0) ||
      (isMineCards && data?.items?.length === 0)
    ) {
      setOpenModal(true)
    } else {
      router.navigate(`${path.decks}`)
    }
  }

  const notifyLearnHandler = () => {
    handleToastInfo(`Add card before learning!`)
  }

  const loadingStatus = isLoading || isFetching || isDeckLoading

  return (
    <>
      {loadingStatus && <LoadingBar />}
      <Page className={s.common} mt={'24px'}>
        <ModalOnEmpty open={openModal} setIsOpenModal={setOpenModal} />
        <ModalAddEditCard open={open} setOpen={setOpen} />
        <ModalAddEditDeck item={deck} open={openEditDeckModal} setOpen={setOpenEditDeckModal} />
        <DeleteModal
          deleteFn={onDeleteDeckHandler}
          open={isDeleteModal}
          setOpen={setIsDeleteModal}
          title={'Delete Deck'}
        >
          <Typography variant={'h1'}>{deck?.name}</Typography>
          <Typography variant={'body1'}>
            Do you really want to delete deck? All cards will be deleted.
          </Typography>
        </DeleteModal>
        <div className={s.heading}>
          <BackBtn onClick={handleOpenModal} to={'#'}>
            {t('cardsPage.backDeckList')}
          </BackBtn>
          <div className={s.headingSecondRow}>
            <div className={clsx(deck?.cover && s.isWithImage)}>
              <div className={s.info}>
                <Typography as={'h1'} variant={'h1'}>
                  {deck?.name}
                </Typography>
                {isMineCards && (
                  <DropdownMenuDemo
                    className={s.dropdown}
                    icon={context?.theme === 'moon' ? groupIcon : groupIconBlack}
                    type={'menu'}
                  >
                    {isCardsCountZero ? (
                      <DropDownItem
                        handleOnClick={notifyLearnHandler}
                        icon={playIcon}
                        text={t('cardsPage.learn')}
                      />
                    ) : (
                      <DropDownItem
                        href={`${path.decks}/${deckId}${path.learn}`}
                        icon={playIcon}
                        text={t('cardsPage.learn')}
                      />
                    )}

                    <DropDownItem
                      handleOnClick={() => setOpenEditDeckModal(true)}
                      icon={menuIcon2}
                      text={t('cardsPage.edit')}
                    />
                    <DropDownItem
                      handleOnClick={() => setIsDeleteModal(true)}
                      icon={menuIcon}
                      text={t('cardsPage.delete')}
                    />
                  </DropdownMenuDemo>
                )}
              </div>
              {isCardsCountFilled && deck?.cover && (
                <img alt={'img'} src={deck?.cover} width={'120px'} />
              )}
            </div>
            {isCardsCountFilled && (
              <div className={s.switchButton}>
                {isMineCards ? (
                  <Button className={s.addCard} onClick={() => setOpen(true)} type={'button'}>
                    <Typography variant={'subtitle2'}>{t('cardsPage.addNewCard')}</Typography>
                  </Button>
                ) : (
                  <Button
                    as={Link}
                    className={s.learnCards}
                    onClick={() => setOpen(true)}
                    to={`${path.decks}/${deckId}${path.learn}`}
                    type={'button'}
                  >
                    <Typography variant={'subtitle2'}>{t('cardsPage.learnCards')}</Typography>
                  </Button>
                )}
              </div>
            )}
          </div>
          {isCardsCountFilled && (
            <Input
              callback={setSearchQuery}
              className={s.input}
              currentValue={search}
              onChange={handleSearch}
              type={'search'}
            />
          )}
        </div>
        {isCardsCountZero ? (
          <div className={s.emptyContent}>
            <Typography variant={'body1'}>
              {isMineCards
                ? `${t('cardsPage.emptyDeck')}`
                : `${t('cardsPage.unfortunatelyEmptyDeck')}`}
            </Typography>
            {isMineCards && (
              <Button className={s.addCard} onClick={() => setOpen(true)} type={'button'}>
                <Typography variant={'subtitle2'}>{t('cardsPage.addNewCard')}</Typography>
              </Button>
            )}
          </div>
        ) : (
          <>
            <TableComponentWithTypes
              data={cardsData?.items}
              isLoading={loadingStatus}
              tableHeader={headersNameCards}
            >
              {item => <SingleRowCard item={item} />}
            </TableComponentWithTypes>
            <div className={s.footer}>
              <PaginationWithSelect
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                selectOptions={selectOptionPagination}
                setCurrentPage={handleCurrentPageChange}
                setItemsPerPage={handleItemsPerPageChange}
                totalItems={cardsData?.pagination.totalItems || 0}
              />
            </div>
          </>
        )}
      </Page>
    </>
  )
}
