import { useState } from 'react'
import { Controller, FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'

import { LearnCardFormValues } from '@/common/zodSchemas/cards/cards.schemas'
import { BackBtn } from '@/components/ui/BackBtn/BackBtn'
import Typography from '@/components/ui/Typography/Typography'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Radio } from '@/components/ui/radio/radio'
import { path } from '@/router/path'
import {
  useGetRandomCardByIdQuery,
  useUpdateCardGradeMutation,
} from '@/services/cards/cards.service'
import { useGetDeckByIdQuery } from '@/services/decks/decks.service'

import s from './learnPage.module.scss'

export const LearnPage = () => {
  const { control, handleSubmit, reset } = useForm<LearnCardFormValues>({
    defaultValues: { grade: undefined },
  })

  const { id = '' } = useParams()

  const [isShowAnswer, setIsShowAnswer] = useState(false)
  const [previousCardId, setPreviousCardId] = useState('')

  const { data: deckData } = useGetDeckByIdQuery({ id })
  const { data: randomCard, isLoading } = useGetRandomCardByIdQuery({
    id,
    previousCardId,
  })

  const [updateCardGrade] = useUpdateCardGradeMutation()

  const gradeNames = [
    { grade: 1, name: 'Did not know' },
    { grade: 2, name: 'Forgot' },
    { grade: 3, name: 'A lot of thought' },
    { grade: 4, name: 'Confused' },
    { grade: 5, name: 'Knew the answer' },
  ]

  const onSubmit: SubmitHandler<FieldValues> = async data => {
    randomCard?.id &&
      (await updateCardGrade({ cardId: randomCard.id, grade: Number(data.grade) })
        .unwrap()
        .then(() => {
          setPreviousCardId(randomCard.id)
          setIsShowAnswer(false)
          reset()
        })
        .catch(() => {
          data.grade === undefined && toast.warn(`Set grade!`)
        }))
  }
  const showAnswwerHandler = () => {
    setIsShowAnswer(true)
  }

  if (isLoading && randomCard) {
    return <div>Loading</div>
  }

  return (
    <section>
      <BackBtn name={'Back to Previous Page'} path={`${path.decks}/${id}`} />
      {randomCard && (
        <Card className={s.card}>
          <div className={s.container}>
            <Typography as={'h1'} className={s.title} variant={'h1'}>
              Learn {deckData?.name}
            </Typography>
            <Typography as={'span'} className={s.question} variant={'subtitle1'}>
              Question:
              <Typography as={'span'} className={s.text} variant={'body1'}>
                {randomCard.question}
              </Typography>
            </Typography>
            {randomCard.questionImg && (
              <div className={s.questionCardImg}>
                <img alt={'question card img'} src={randomCard.questionImg} />
              </div>
            )}
            <Typography as={'h2'} className={s.passQuest} variant={'body2'}>
              Count of attempts: {randomCard.shots}
            </Typography>
            {isShowAnswer ? (
              <>
                <Typography as={'span'} className={s.question} variant={'subtitle1'}>
                  Answer:
                  <Typography as={'span'} className={s.text} variant={'body1'}>
                    {randomCard.answer}
                  </Typography>
                </Typography>
                {randomCard.answerImg && (
                  <div className={s.answerCardImg}>
                    <img alt={'answer card img'} src={randomCard.answerImg} />
                  </div>
                )}
                <form onSubmit={handleSubmit(onSubmit)}>
                  <Controller
                    control={control}
                    name={'grade'}
                    render={({ field }) => (
                      <Radio.Root
                        className={s.radio}
                        name={field.name}
                        onValueChange={value => field.onChange(value)}
                        value={`${field.value}`}
                      >
                        {gradeNames.map(grade => (
                          <Radio.Item key={grade.name} value={`${grade.grade}`}>
                            <Typography variant={'body2'}>{grade.name}</Typography>
                          </Radio.Item>
                        ))}
                      </Radio.Root>
                    )}
                  />
                  <Button as={'button'} className={s.nextQuestionBtn} fullWidth type={'submit'}>
                    <Typography as={'span'}>Next Question</Typography>
                  </Button>
                </form>
              </>
            ) : (
              <Button as={'button'} className={s.showBtn} onClick={showAnswwerHandler}>
                <Typography as={'span'}>Show Answer</Typography>
              </Button>
            )}
          </div>
        </Card>
      )}
    </section>
  )
}