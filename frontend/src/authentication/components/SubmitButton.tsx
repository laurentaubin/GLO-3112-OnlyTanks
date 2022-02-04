import { isFormInvalid } from "../utils/isFormInvalid";
import { State } from "../../main/hooks/useAxios";
import { SpinnerIcon } from "../../main/components/SpinnerIcon";
import * as React from "react";
import { LoginValues } from "./login/LoginForm";
import User from "../../main/domain/User";
import { FormikErrors, FormikTouched } from "formik";

interface Props {
  label: string;
  formErrors: FormikErrors<LoginValues | User>;
  touched: FormikTouched<LoginValues | User>;
  initialValues: LoginValues | User;
  state: State;
}

export const SubmitButton = ({ label, formErrors, touched, initialValues, state }: Props) => {
  return (
    <button
      className={
        "text-white rounded py-2 mt-2 w-full " + (isFormInvalid(formErrors, touched, initialValues) ? "bg-blue-200" : "bg-blue-400")
      }
      type="submit"
      disabled={isFormInvalid(formErrors, touched, initialValues)}
    >
      <span className={state === State.LOADING ? "ml-4" : ""}>{label}</span>
      <span className="relative float-right mt-1 mr-4">{state === State.LOADING && <SpinnerIcon size={20} />}</span>
    </button>
  );
};
