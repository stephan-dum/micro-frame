const createFormData = (form: HTMLFormElement) => {
  const formData = new FormData(form);
  const data: Record<string, unknown> = {};

  formData.forEach((value, key) => {
    data[key] = value;
  });

  return data;
}

export default createFormData;
