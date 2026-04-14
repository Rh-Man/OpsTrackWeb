import { Amplify } from 'aws-amplify'

export const configureAmplify = () => {
  const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID
  const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID
  const region = process.env.NEXT_PUBLIC_REGION

  console.log('🔧 Amplify Configuration:', {
    userPoolId,
    clientId,
    region,
  })

  if (!userPoolId || !clientId || !region) {
    console.error('❌ Missing Amplify configuration! Check your .env.local file')
    return
  }

  try {
    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId,
          userPoolClientId: clientId,
          loginWith: {
            email: true,
          },
          signUpVerificationMethod: 'code',
          userAttributes: {
            email: {
              required: true,
            },
            name: {
              required: false,
            },
          },
          passwordFormat: {
            minLength: 8,
            requireLowercase: true,
            requireUppercase: true,
            requireNumbers: true,
            requireSpecialCharacters: true,
          },
        },
      },
    }, {
      ssr: false
    })

    console.log('✅ Amplify configured successfully!')
  } catch (error) {
    console.error('❌ Error configuring Amplify:', error)
  }
}
