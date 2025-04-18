import React, { useState, useEffect, useCallback } from "react";
import { createRoot } from "react-dom/client";

// 1. Определение типов для TS
interface Param {
  id: number;
  name: string;
  type: "string" | "number";
}

interface ParamValue {
  paramId: number;
  value: string;
}

interface Color {
  id: number;
  name: string;
}

interface Model {
  paramValues: ParamValue[];
  colors: Color[];
}

interface Props {
  params: Param[];
  model: Model;
}

// 2. Основной компонент
const ParamEditor: React.FC<Props> = ({ params, model }) => {
  const [paramValues, setParamValues] = useState<Record<number, string>>(() => {
    const initialValues: Record<number, string> = {};
    model.paramValues.forEach((item) => {
      initialValues[item.paramId] = item.value;
    });
    return initialValues;
  });

  const [errors, setErrors] = useState<Record<number, string>>({});
  const [dirtyFields, setDirtyFields] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const newValues: Record<number, string> = {};
    model.paramValues.forEach((item) => {
      newValues[item.paramId] = item.value;
    });
    setParamValues(newValues);
  }, [model]);

  // 3. Валидация значений параметров
  const validateParamValue = (
    paramName: string,
    value: string
  ): string | null => {
    const allowedValues: Record<string, string[]> = {
      Назначение: ["повседневное", "спортивное"],
      Длина: ["макси", "мини"],
      Цвет: ["белый", "синий"],
    };

    if (allowedValues[paramName]) {
      if (value && !allowedValues[paramName].includes(value.toLowerCase())) {
        return `Допустимые значения: ${allowedValues[paramName].join(", ")}`;
      }
    }
    return null;
  };

  const handleParamChange = useCallback(
    (paramId: number, value: string) => {
      setParamValues((prev) => ({
        ...prev,
        [paramId]: value,
      }));

      // Сбрасываем ошибку при изменении
      if (errors[paramId]) {
        setErrors((prev) => ({ ...prev, [paramId]: "" }));
      }
    },
    [errors]
  );

  const handleBlur = useCallback(
    (paramId: number, paramName: string) => {
      const value = paramValues[paramId] || "";
      const error = validateParamValue(paramName, value);

      setErrors((prev) => ({
        ...prev,
        [paramId]: error || "",
      }));

      setDirtyFields((prev) => ({
        ...prev,
        [paramId]: true,
      }));
    },
    [paramValues]
  );

  const getModel = useCallback((): Model => {
    const paramValuesArray: ParamValue[] = Object.entries(paramValues).map(
      ([paramId, value]) => ({
        paramId: Number(paramId),
        value,
      })
    );
    return {
      ...model,
      paramValues: paramValuesArray,
    };
  }, [paramValues, model]);

  const handleClick = () => {
    // Проверяем все поля inpuit перед отправкой формы
    const newErrors: Record<number, string> = {};
    let hasErrors = false;

    params.forEach((param) => {
      const error = validateParamValue(param.name, paramValues[param.id] || "");
      if (error) {
        newErrors[param.id] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    setDirtyFields(
      params.reduce((acc, param) => ({ ...acc, [param.id]: true }), {})
    );

    if (hasErrors) {
      alert("Пожалуйста, исправьте ошибки перед отправкой");
      return;
    }

    const currentModel = getModel();
    const formattedOutput = params
      .map((param) => {
        const value =
          currentModel.paramValues.find((p) => p.paramId === param.id)?.value ||
          "не указано";
        return `${param.name}: ${value}`;
      })
      .join("\n");

    alert(`Введённые значения параметров:\n\n${formattedOutput}`);
  };

  // 4. Вспомогательная функция для подсказок под инпутом
  const getHintForParam = (paramName: string): string => {
    const hints: Record<string, string> = {
      Назначение: "повседневное, спортивное",
      Длина: "макси, мини",
      Цвет: "белый, синий",
    };
    return hints[paramName] || "текстовое значение string";
  };

  // 5. Рендеринг компонента
  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "20px auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        border: "1px solid #eee",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          color: "black",
          marginBottom: "20px",
        }}
      >
        Редактор параметров
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {params.map((param) => (
          <div
            key={param.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <label
              style={{
                fontWeight: "bold",
                color: "black",
                minWidth: "100px",
                textAlign: "left",
              }}
            >
              {param.name}
            </label>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                value={paramValues[param.id] || ""}
                onChange={(e) => handleParamChange(param.id, e.target.value)}
                onBlur={() => handleBlur(param.id, param.name)}
                placeholder={`Введите ${param.name.toLowerCase()}...`}
                style={{
                  width: "95%",
                  padding: "8px 12px",
                  border: `1px solid ${
                    dirtyFields[param.id] && errors[param.id] ? "red" : "#ddd"
                  }`,
                  borderRadius: "4px",
                  fontSize: "16px",
                }}
              />
              <div
                style={{
                  fontSize: "13px",
                  color:
                    dirtyFields[param.id] && errors[param.id] ? "red" : "gray",
                  marginTop: "5px",
                  fontStyle: "italic",
                }}
              >
                {dirtyFields[param.id] && errors[param.id]
                  ? errors[param.id]
                  : `Доступные параметры: ${getHintForParam(param.name)}`}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleClick}
        style={{
          marginTop: "20px",
          padding: "10px 15px",
          backgroundColor: "black",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "16px",
          width: "100%",
        }}
      >
        Показать выбранные параметры
      </button>
    </div>
  );
};

// 6. Масштабируемые данные
const demoParams: Param[] = [
  { id: 1, name: "Назначение", type: "string" },
  { id: 2, name: "Длина", type: "string" },
  { id: 3, name: "Цвет", type: "string" },
];

const demoModel: Model = {
  paramValues: [
    { paramId: 1, value: "повседневное" },
    { paramId: 2, value: "макси" },
  ],
  colors: [
    { id: 1, name: "белый" },
    { id: 2, name: "синий" },
  ],
};

// 7. Компонент App
const App: React.FC = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "20px",
        backgroundColor: "white",
      }}
    >
      <ParamEditor params={demoParams} model={demoModel} />
    </div>
  );
};

// 8. Рендеринг приложения
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
