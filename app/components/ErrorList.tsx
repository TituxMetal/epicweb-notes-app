type ErrorListProps = {
  errors?: Array<string> | null
}

export const ErrorList = ({ errors }: ErrorListProps) => {
  return errors?.length ? (
    <ul className='flex flex-col gap-1'>
      {errors.map((error, index) => (
        <li key={index} className='text-lg font-bold text-rose-300'>
          {error}
        </li>
      ))}
    </ul>
  ) : null
}
