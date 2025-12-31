-- Migration: Enable Row Level Security on cases and artifacts tables
-- Applied: 2025-12-31
-- Fixes Supabase Security Advisor errors

-- Enable RLS on cases table
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- Enable RLS on artifacts table  
ALTER TABLE public.artifacts ENABLE ROW LEVEL SECURITY;

-- Policies for cases (users can only access their own cases)
CREATE POLICY "Users can view their own cases" ON public.cases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cases" ON public.cases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cases" ON public.cases  
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cases" ON public.cases
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for artifacts (via case ownership)
CREATE POLICY "Users can view artifacts of their cases" ON public.artifacts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.cases WHERE cases.id = artifacts.case_id AND cases.user_id = auth.uid())
  );

CREATE POLICY "Users can insert artifacts to their cases" ON public.artifacts
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.cases WHERE cases.id = artifacts.case_id AND cases.user_id = auth.uid())
  );

CREATE POLICY "Users can update artifacts of their cases" ON public.artifacts
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.cases WHERE cases.id = artifacts.case_id AND cases.user_id = auth.uid())
  );

CREATE POLICY "Users can delete artifacts of their cases" ON public.artifacts
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.cases WHERE cases.id = artifacts.case_id AND cases.user_id = auth.uid())
  );

-- Fix handle_new_user function search path
ALTER FUNCTION public.handle_new_user() SET search_path = public;
