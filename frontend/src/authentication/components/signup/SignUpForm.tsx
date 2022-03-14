import { AxiosError, AxiosResponse } from "axios";
import { Form, Formik, useFormikContext } from "formik";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import * as Yup from "yup";
import { State } from "../../../main/hooks/useAxios";
import { useSignUp } from "../../api/useSignUp";
import { FormikField } from "../../../main/components/FormikField";
import User from "../../../main/domain/user/User";
import { setErrors } from "../../utils/setErrors";
import { FormikPhoneNumberField } from "../../../main/components/FormikPhoneNumberField";
import { useCookies } from "react-cookie";
import AuthProvider from "../../domain/AuthProvider";
import { constants } from "../../../constants/constants";
import { normalizeInputs } from "../../../main/utils/inputUtils";
import { NextButton } from "../NextButton";

interface InternalSignUpFormProps {
  data: AxiosResponse | undefined;
  state: State;
  error: AxiosError | undefined;
  provider: string | string[] | undefined;
}

const InternalSignUpForm = ({ data, state, error, provider }: InternalSignUpFormProps) => {
  const { values, errors: formErrors, touched, setErrors: setFormErrors, initialValues } = useFormikContext<User>();

  const router = useRouter();
  const [, setCookie] = useCookies([constants.AUTH_PROVIDER_COOKIE, constants.SESSION_TOKEN_COOKIE]);

  useEffect(() => {
    switch (state) {
      case State.SUCCESS:
        setCookies(data?.data.token);
        router.push({ pathname: "/signup/picture", query: { username: values.username } });
        break;

      case State.ERROR:
        setErrors(error?.response?.data.errors, setFormErrors);
        break;
    }
  }, [router, state]);

  const setCookies = (token: string) => {
    setCookie(constants.AUTH_PROVIDER_COOKIE, provider ? provider : AuthProvider.LOCAL, { maxAge: constants.SESSION_TOKEN_TTL });
    setCookie(constants.SESSION_TOKEN_COOKIE, token, { maxAge: constants.SESSION_TOKEN_TTL });
  };

  return (
    <Form className="text-center align-middle justify-center">
      <FormikField name="username" placeholder="Username" isError={!!(formErrors.username && touched.username)} />

      <FormikField name="firstName" placeholder="First name" isError={!!(formErrors.firstName && touched.firstName)} />

      <FormikField name="lastName" placeholder="Last name" isError={!!(formErrors.lastName && touched.lastName)} />

      <FormikField name="email" placeholder="Email" isError={!!(formErrors.email && touched.email)} isDisabled={!!initialValues.email} />

      <FormikPhoneNumberField name="phoneNumber" placeholder="Phone number" isError={!!(formErrors.phoneNumber && touched.phoneNumber)} />

      <NextButton label={"Next"} formErrors={formErrors} touched={touched} initialValues={initialValues} state={state} />
    </Form>
  );
};

export const SignUpForm = () => {
  const { data, state, signUpUser, error } = useSignUp();
  const router = useRouter();
  const { provider, firstName, lastName, email } = router.query;

  const initialValues: User = {
    username: "",
    firstName: (firstName as string) || "",
    lastName: (lastName as string) || "",
    email: (email as string) || "",
    phoneNumber: ""
  };

  const validationSchema = Yup.object().shape({
    username: Yup.string()
      .matches(/^[a-zA-Z0-9]+$/, "Invalid username")
      .required(" "),
    firstName: Yup.string().required(" "),
    lastName: Yup.string().required(" "),
    email: Yup.string().email("Invalid email").required(" "),
    phoneNumber: Yup.string().required(" ")
  });

  const onSubmit = async (values: User) => {
    const normalizedInputs = normalizeInputs(values);
    await signUpUser(normalizedInputs);
  };

  return (
    <div>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        validateOnBlur={false}
        initialStatus={{}}
      >
        <InternalSignUpForm data={data} state={state} error={error} provider={provider} />
      </Formik>
    </div>
  );
};
