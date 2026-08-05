# Paquete de Superpoderes para Ollama

Runtime gobernado de agentes optimizado para `gpt-oss:20b` local y `glm-5.2:cloud` en tareas de largo horizonte.

## Início rápido / Quick start

1. Instala Ollama y verifica con `ollama --version`.
2. Descarga el modelo local: `ollama pull gpt-oss:20b`.
3. Inicia sesión para cloud: `ollama signin`.
4. Copia `.env.example` a `.env`.
5. Ejecuta `scripts/install.ps1 -PullModels` en Windows o `scripts/install.sh --pull-models` en Linux/macOS.
6. Ejecuta `ollama-superpowers-doctor`.
7. Empieza con:
   `ollama-superpowers --agent repo-cartographer --task "Mapea este repositorio" --workspace .`

## Arquitetura / Architecture

La arquitectura tiene siete capas: sonda de capacidades, enrutador de dos cerebros, cartógrafo de contexto, malla de herramientas, bucle de agentes, gates de verificación y libro de evidencias. El modo predeterminado es de solo lectura. La escritura exige dos habilitaciones.

## Otimização / Optimization

La pantalla de uso suministrada muestra uso concentrado en `glm-5.2` y casi nulo en `gpt-oss:20b`. El paquete corrige el desequilibrio: trabajo rutinario, privado y estructurado queda local; GLM se reserva para síntesis de gran contexto, arquitectura transversal y trayectorias largas. Los valores de la captura son observacionales y no se consultan automáticamente.
