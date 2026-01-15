export class CnpjApiResponseDto {
  razao_social: string;
  estabelecimento: {
    email?: string;
    telefones?: Array<{
      ddd: string;
      numero: string;
    }>;
  };
  email?: string;
}