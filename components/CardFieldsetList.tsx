import type { TFunction } from 'next-i18next'

export interface CardFieldsetListProps {
  fieldsetList: Array<Array<{ label: string; value: React.ReactNode }>>
  t: TFunction
}

const CardFieldsetList = ({ fieldsetList, t }: CardFieldsetListProps) => (
  <div className="md:flex md:divide-x md:divide-light-grey md:my-3">
    {fieldsetList.map((fieldset, fidx) => (
      <div key={fieldset.map(i => i?.label ?? '').join()} className="card-fieldset">
        {fieldset
          .filter(i => i)
          .map((i, idx) => (
            <div
              key={i.label}
              className="card-field"
              attr-last={`${fidx === fieldsetList.length - 1 && idx === fieldset.length - 1}`}
            >
              <span className="card-label">{t(i.label)}</span>
              {i.value}
            </div>
          ))}
      </div>
    ))}
  </div>
)

export default CardFieldsetList
