type ErrorListProps = {
  listId?: string
  errorMessages?: string[] | null
}

export const ErrorList = ({ listId, errorMessages }: ErrorListProps): JSX.Element | null => {
  return errorMessages?.length ? (
    <ul id={listId} className='flex flex-col gap-1'>
      {errorMessages.map((errorMessage, index) => (
        <li key={index} className='text-lg font-bold text-rose-300'>
          {errorMessage}
        </li>
      ))}
    </ul>
  ) : null
}
