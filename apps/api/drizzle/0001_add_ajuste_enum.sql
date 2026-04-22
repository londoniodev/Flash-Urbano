-- Añadir AJUSTE si no existe
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'movement_type' AND e.enumlabel = 'AJUSTE') THEN 
    ALTER TYPE "public"."movement_type" ADD VALUE 'AJUSTE'; 
  END IF; 
END $$;

-- Añadir TRASLADO si no existe
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'movement_type' AND e.enumlabel = 'TRASLADO') THEN 
    ALTER TYPE "public"."movement_type" ADD VALUE 'TRASLADO'; 
  END IF; 
END $$;
