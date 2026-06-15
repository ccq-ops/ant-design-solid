import { fireEvent, render, screen } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '../../button'
import { ConfigProvider } from '../../config-provider'
import { Form, useForm } from '../../form'
import { Radio } from '../index'

describe('Radio', () => {
  it('supports controlled checked state', () => {
    const [checked, setChecked] = createSignal(true)
    const onChange = vi.fn()
    const result = render(() => (
      <Radio checked={checked()} onChange={onChange}>
        Choice
      </Radio>
    ))
    const input = result.getByRole('radio', { name: 'Choice' }) as HTMLInputElement

    expect(input.checked).toBe(true)
    expect(result.container.querySelector('.ads-radio-checked')).toBeTruthy()

    setChecked(false)

    expect(input.checked).toBe(false)
    expect(result.container.querySelector('.ads-radio-checked')).toBeFalsy()
  })

  it('restores controlled checked state when parent does not update', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Radio checked={false} onChange={onChange}>
        Controlled
      </Radio>
    ))
    const input = result.getByRole('radio', { name: 'Controlled' }) as HTMLInputElement

    fireEvent.click(input)

    expect(onChange).toHaveBeenCalledOnce()
    expect(input.checked).toBe(false)
    expect(result.container.querySelector('.ads-radio-checked')).toBeFalsy()
  })

  it('supports defaultChecked and selects when uncontrolled', () => {
    const onChange = vi.fn()
    const checkedResult = render(() => <Radio defaultChecked>Default</Radio>)
    const checkedInput = checkedResult.getByRole('radio', { name: 'Default' }) as HTMLInputElement

    expect(checkedInput.checked).toBe(true)

    const result = render(() => <Radio onChange={onChange}>Pick</Radio>)
    const input = result.getByRole('radio', { name: 'Pick' }) as HTMLInputElement

    expect(input.checked).toBe(false)

    fireEvent.click(input)

    expect(input.checked).toBe(true)
    expect(onChange).toHaveBeenCalledOnce()
  })

  it('does not update or fire onChange when disabled', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Radio disabled onChange={onChange}>
        Disabled
      </Radio>
    ))
    const input = result.getByRole('radio', { name: 'Disabled' }) as HTMLInputElement

    expect(input.disabled).toBe(true)

    fireEvent.click(input)

    expect(onChange).not.toHaveBeenCalled()
    expect(input.checked).toBe(false)
  })
  it('supports semantic classNames and styles plus imperative focus and blur', () => {
    // Solid assigns component refs through JSX at runtime.
    // oxlint-disable-next-line no-unassigned-vars
    const ref: { current?: { focus: () => void; blur: () => void } } = {}
    render(() => (
      <Radio
        ref={ref}
        classNames={{ wrapper: 'custom-wrapper', input: 'custom-input' }}
        styles={{ wrapper: { color: 'red' }, input: { margin: '1px' } }}
      >
        Styled
      </Radio>
    ))

    const input = screen.getByRole('radio', { name: 'Styled' }) as HTMLInputElement
    const wrapper = input.closest('label')!

    expect(wrapper).toHaveClass('custom-wrapper')
    expect(wrapper.style.color).toBe('red')
    expect(input).toHaveClass('custom-input')
    expect(input).toHaveStyle({ margin: '1px' })

    ref.current?.focus()
    expect(document.activeElement).toBe(input)

    ref.current?.blur()
    expect(document.activeElement).not.toBe(input)
  })

  it('supports antd v6 semantic classNames and styles aliases', () => {
    render(() => (
      <Radio
        classNames={{ root: 'custom-root', icon: 'custom-icon', label: 'custom-label' }}
        styles={{ root: { color: 'red' }, icon: { margin: '1px' }, label: { color: 'blue' } }}
      >
        Semantic
      </Radio>
    ))

    const input = screen.getByRole('radio', { name: 'Semantic' }) as HTMLInputElement
    const wrapper = input.closest('label')!

    expect(wrapper).toHaveClass('custom-root')
    expect(wrapper.style.color).toBe('red')
    expect(input).toHaveClass('custom-icon')
    expect(input).toHaveStyle({ margin: '1px' })
    expect(wrapper.querySelector('.custom-label')).toHaveStyle({ color: 'rgb(0, 0, 255)' })
  })

  it('supports rootClass for the radio wrapper', () => {
    const result = render(() => (
      <Radio rootClass="custom-root-class" class="custom-class">
        Root class
      </Radio>
    ))

    const wrapper = result.getByRole('radio', { name: 'Root class' }).closest('label')!

    expect(wrapper).toHaveClass('custom-root-class')
    expect(wrapper).toHaveClass('custom-class')
  })

  it('supports custom prefixCls from props and ConfigProvider', () => {
    const withProp = render(() => <Radio prefixCls="custom-radio">Prop prefix</Radio>)
    expect(withProp.container.querySelector('.custom-radio')).toBeTruthy()

    const withProvider = render(() => (
      <ConfigProvider prefixCls="custom">
        <Radio>Provider prefix</Radio>
      </ConfigProvider>
    ))
    expect(withProvider.container.querySelector('.custom-radio')).toBeTruthy()
  })

  it('supports Radio.Button children with group context and generated input name', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Radio.Group defaultValue="a" onChange={onChange}>
        <Radio value="a">A</Radio>
        <Radio.Button value="b">B</Radio.Button>
      </Radio.Group>
    ))
    const a = result.getByRole('radio', { name: 'A' }) as HTMLInputElement
    const b = result.getByRole('radio', { name: 'B' }) as HTMLInputElement

    expect(a.checked).toBe(true)
    expect(b.checked).toBe(false)
    expect(a.name).toBeTruthy()
    expect(b.name).toBe(a.name)
    expect(b.closest('label')).toHaveClass('ads-radio-button-wrapper')

    fireEvent.click(b)

    expect(a.checked).toBe(false)
    expect(b.checked).toBe(true)
    expect(onChange).toHaveBeenLastCalledWith('b')
  })

  it('supports skipGroup to keep a radio independent inside a group', () => {
    const onGroupChange = vi.fn()
    const onRadioChange = vi.fn()
    const result = render(() => (
      <Radio.Group defaultValue="a" onChange={onGroupChange}>
        <Radio value="a">A</Radio>
        <Radio value="b" skipGroup onChange={onRadioChange}>
          B
        </Radio>
      </Radio.Group>
    ))
    const a = result.getByRole('radio', { name: 'A' }) as HTMLInputElement
    const b = result.getByRole('radio', { name: 'B' }) as HTMLInputElement

    expect(a.checked).toBe(true)
    expect(b.checked).toBe(false)
    expect(b.name).toBe('')

    fireEvent.click(b)

    expect(a.checked).toBe(true)
    expect(b.checked).toBe(true)
    expect(onGroupChange).not.toHaveBeenCalled()
    expect(onRadioChange).toHaveBeenCalledOnce()
  })

  it('passes group name and disabled state to child radios', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Radio.Group name="choices" disabled onChange={onChange}>
        <Radio value="a">A</Radio>
        <Radio.Button value="b">B</Radio.Button>
      </Radio.Group>
    ))
    const a = result.getByRole('radio', { name: 'A' }) as HTMLInputElement
    const b = result.getByRole('radio', { name: 'B' }) as HTMLInputElement

    expect(a.name).toBe('choices')
    expect(b.name).toBe('choices')
    expect(a.disabled).toBe(true)
    expect(b.disabled).toBe(true)

    fireEvent.click(a)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('supports block, vertical orientation, size, buttonStyle, semantic classes and semantic styles', () => {
    const result = render(() => (
      <Radio.Group
        block
        vertical
        orientation="horizontal"
        size="large"
        buttonStyle="solid"
        optionType="button"
        classNames={{ wrapper: 'group-wrapper' }}
        styles={{ wrapper: { width: '100%' } }}
        options={[{ label: 'A', value: 'a' }]}
      />
    ))
    const group = result.container.querySelector('.ads-radio-group') as HTMLElement

    expect(group).toHaveClass('ads-radio-group-block')
    expect(group).toHaveClass('ads-radio-group-horizontal')
    expect(group).not.toHaveClass('ads-radio-group-vertical')
    expect(group).toHaveClass('ads-radio-group-large')
    expect(group).toHaveClass('ads-radio-group-solid')
    expect(group).toHaveClass('group-wrapper')
    expect(group).toHaveStyle({ width: '100%' })
  })

  it('supports vertical prop when orientation is omitted', () => {
    const result = render(() => <Radio.Group vertical options={[{ label: 'A', value: 'a' }]} />)

    expect(result.container.querySelector('.ads-radio-group')).toHaveClass(
      'ads-radio-group-vertical',
    )
  })

  it('passes option style, class, title, id, required, and onChange to option radios', () => {
    const optionChange = vi.fn()
    const result = render(() => (
      <Radio.Group
        options={[
          {
            label: 'A',
            value: 'a',
            class: 'option-a',
            style: { color: 'blue' },
            title: 'Option A',
            id: 'option-a-input',
            required: true,
            onChange: optionChange,
          },
        ]}
      />
    ))
    const input = result.getByRole('radio', { name: 'A' }) as HTMLInputElement
    const wrapper = input.closest('label')!

    expect(input.id).toBe('option-a-input')
    expect(input.required).toBe(true)
    expect(wrapper).toHaveClass('option-a')
    expect(wrapper.style.color).toBe('blue')
    expect(wrapper).toHaveAttribute('title', 'Option A')

    fireEvent.click(input)

    expect(optionChange).toHaveBeenCalledOnce()
  })

  it('passes option rootClass and semantic customizations to option radios', () => {
    const result = render(() => (
      <Radio.Group
        options={[
          {
            label: 'A',
            value: 'a',
            rootClass: 'option-root',
            classNames: {
              root: 'option-semantic-root',
              icon: 'option-icon',
              label: 'option-label',
            },
            styles: { root: { color: 'green' }, icon: { margin: '2px' } },
          },
        ]}
      />
    ))
    const input = result.getByRole('radio', { name: 'A' }) as HTMLInputElement
    const wrapper = input.closest('label')!

    expect(wrapper).toHaveClass('option-root')
    expect(wrapper).toHaveClass('option-semantic-root')
    expect(wrapper.style.color).toBe('green')
    expect(input).toHaveClass('option-icon')
    expect(input).toHaveStyle({ margin: '2px' })
    expect(wrapper.querySelector('.option-label')).toBeTruthy()
  })
})

describe('Radio.Group', () => {
  it('updates value using options', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Radio.Group
        defaultValue="a"
        options={[
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ]}
        onChange={onChange}
      />
    ))
    const a = result.getByRole('radio', { name: 'A' }) as HTMLInputElement
    const b = result.getByRole('radio', { name: 'B' }) as HTMLInputElement

    expect(a.checked).toBe(true)
    expect(b.checked).toBe(false)

    fireEvent.click(b)

    expect(a.checked).toBe(false)
    expect(b.checked).toBe(true)
    expect(onChange).toHaveBeenLastCalledWith('b')
  })

  it('restores controlled option checked state when parent does not update', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Radio.Group
        value="a"
        options={[
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ]}
        onChange={onChange}
      />
    ))
    const a = result.getByRole('radio', { name: 'A' }) as HTMLInputElement
    const b = result.getByRole('radio', { name: 'B' }) as HTMLInputElement

    fireEvent.click(b)

    expect(onChange).toHaveBeenCalledWith('b')
    expect(a.checked).toBe(true)
    expect(b.checked).toBe(false)
  })

  it('does not update or call onChange when group or option is disabled', () => {
    const onGroupChange = vi.fn()
    const groupDisabled = render(() => (
      <Radio.Group
        disabled
        defaultValue="a"
        options={[
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ]}
        onChange={onGroupChange}
      />
    ))
    const disabledB = groupDisabled.getByRole('radio', { name: 'B' }) as HTMLInputElement

    expect(disabledB.disabled).toBe(true)
    fireEvent.click(disabledB)
    expect(disabledB.checked).toBe(false)
    expect(onGroupChange).not.toHaveBeenCalled()

    const onOptionChange = vi.fn()
    const optionDisabled = render(() => (
      <Radio.Group
        defaultValue="a"
        options={[
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b', disabled: true },
        ]}
        onChange={onOptionChange}
      />
    ))
    const optionB = optionDisabled.getByRole('radio', { name: 'B' }) as HTMLInputElement

    expect(optionB.disabled).toBe(true)
    fireEvent.click(optionB)
    expect(optionB.checked).toBe(false)
    expect(onOptionChange).not.toHaveBeenCalled()
  })

  it('marks button groups for compact border styling and supports non-first checked borders', () => {
    const result = render(() => (
      <Radio.Group
        optionType="button"
        defaultValue="b"
        options={[
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
          { label: 'C', value: 'c' },
        ]}
      />
    ))
    const wrappers = result.container.querySelectorAll('.ads-radio-button-wrapper')

    expect(result.container.querySelector('.ads-radio-group-button')).toHaveClass(
      'ads-radio-group-button-compact',
    )
    expect(wrappers[0]).not.toHaveClass('ads-radio-button-wrapper-checked')
    expect(wrappers[1]).toHaveClass('ads-radio-button-wrapper-checked')
    expect(document.head.textContent).toContain(
      '.ads-radio-button-wrapper-checked:not(:first-child)',
    )
  })

  it('removes button wrapper spacing and collapses adjacent borders', () => {
    render(() => (
      <Radio.Group
        optionType="button"
        options={[
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ]}
      />
    ))

    const styles = [...document.head.querySelectorAll('style')]
      .map((style) => style.textContent ?? '')
      .join('\n')

    expect(styles).toContain(
      '.ads-radio-group-button .ads-radio-button-wrapper{gap:0;margin-inline-end:0;}',
    )
    expect(styles).toContain('.ads-radio-group-button{gap:0;}')
    expect(styles).toContain(
      '.ads-radio-group-button-compact .ads-radio-button-wrapper + .ads-radio-button-wrapper{margin-inline-start:-1px;}',
    )
    expect(styles).toContain(
      '.ads-radio-button-wrapper input[type="radio"]{height:0;opacity:0;pointer-events:none;width:0;}',
    )
  })

  it('keeps child Radio.Button groups compact without external spacing', () => {
    const result = render(() => (
      <Radio.Group defaultValue="b">
        <Radio.Button value="a">A</Radio.Button>
        <Radio.Button value="b">B</Radio.Button>
      </Radio.Group>
    ))

    expect(result.container.querySelector('.ads-radio-group-button-compact')).toBeTruthy()
    expect(result.container.querySelectorAll('.ads-radio-button-wrapper')).toHaveLength(2)
  })

  it('supports optionType button classes', () => {
    const result = render(() => (
      <Radio.Group
        optionType="button"
        defaultValue="a"
        options={[
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ]}
      />
    ))

    expect(result.container.querySelector('.ads-radio-group-button')).toBeTruthy()
    expect(result.container.querySelectorAll('.ads-radio-button-wrapper')).toHaveLength(2)
    expect(result.container.querySelector('.ads-radio-button-wrapper-checked')).toBeTruthy()
  })

  it('emits pixel line heights for button wrappers', () => {
    render(() => (
      <>
        <Radio.Group optionType="button" options={[{ label: 'Default', value: 'default' }]} />
        <Radio.Group
          optionType="button"
          size="small"
          options={[{ label: 'Small', value: 'small' }]}
        />
        <Radio.Group
          optionType="button"
          size="large"
          options={[{ label: 'Large', value: 'large' }]}
        />
      </>
    ))

    const styles = [...document.head.querySelectorAll('style')]
      .map((style) => style.textContent ?? '')
      .join('\n')

    expect(styles).toContain('.ads-radio-button-wrapper{')
    expect(styles).toContain('height:32px;')
    expect(styles).toContain('line-height:32px;')
    expect(styles).toContain('.ads-radio-group-small .ads-radio-button-wrapper{')
    expect(styles).toContain('height:24px;')
    expect(styles).toContain('line-height:24px;')
    expect(styles).toContain('.ads-radio-group-large .ads-radio-button-wrapper{')
    expect(styles).toContain('height:40px;')
    expect(styles).toContain('line-height:40px;')
    expect(styles).not.toContain('line-height:32;')
    expect(styles).not.toContain('line-height:24;')
    expect(styles).not.toContain('line-height:40;')
  })

  it('supports group rootClass and semantic root aliases', () => {
    const result = render(() => (
      <Radio.Group
        rootClass="group-root-class"
        classNames={{ root: 'group-root' }}
        styles={{ root: { margin: '4px' } }}
        options={[{ label: 'A', value: 'a' }]}
      />
    ))
    const group = result.container.querySelector('.ads-radio-group') as HTMLElement

    expect(group).toHaveClass('group-root-class')
    expect(group).toHaveClass('group-root')
    expect(group).toHaveStyle({ margin: '4px' })
  })

  it('clears Form.Item group display when resetFields resets to undefined', () => {
    const [form] = useForm()
    const result = render(() => (
      <Form form={form}>
        <Form.Item name="choice">
          <Radio.Group
            options={[
              { label: 'A', value: 'a' },
              { label: 'B', value: 'b' },
            ]}
          />
        </Form.Item>
      </Form>
    ))
    const a = result.getByRole('radio', { name: 'A' }) as HTMLInputElement
    const b = result.getByRole('radio', { name: 'B' }) as HTMLInputElement

    fireEvent.click(b)
    expect(form.getFieldValue('choice')).toBe('b')
    expect(a.checked).toBe(false)
    expect(b.checked).toBe(true)

    form.resetFields()

    expect(form.getFieldValue('choice')).toBeUndefined()
    expect(a.checked).toBe(false)
    expect(b.checked).toBe(false)
  })

  it('integrates with Form.Item value semantics', () => {
    const [form] = useForm()
    const onFinish = vi.fn()
    const result = render(() => (
      <Form form={form} onFinish={onFinish}>
        <Form.Item name="choice">
          <Radio.Group
            options={[
              { label: 'A', value: 'a' },
              { label: 'B', value: 'b' },
            ]}
          />
        </Form.Item>
        <Button htmlType="submit">Submit</Button>
      </Form>
    ))
    const b = result.getByRole('radio', { name: 'B' }) as HTMLInputElement

    fireEvent.click(b)

    expect(form.getFieldValue('choice')).toBe('b')
    expect(b.checked).toBe(true)

    fireEvent.click(result.getByRole('button', { name: 'Submit' }))

    expect(onFinish).toHaveBeenCalledWith({ choice: 'b' })
  })

  it('updates Form.Item value on blur when trigger is onBlur', () => {
    const [form] = useForm()
    const result = render(() => (
      <Form form={form} initialValues={{ choice: 'a' }}>
        <Form.Item name="choice" trigger="onBlur">
          <Radio.Group
            options={[
              { label: 'A', value: 'a' },
              { label: 'B', value: 'b' },
            ]}
          />
        </Form.Item>
      </Form>
    ))
    const a = result.getByRole('radio', { name: 'A' }) as HTMLInputElement
    const b = result.getByRole('radio', { name: 'B' }) as HTMLInputElement

    expect(a.checked).toBe(true)
    expect(b.checked).toBe(false)

    fireEvent.click(b)

    expect(a.checked).toBe(false)
    expect(b.checked).toBe(true)
    expect(form.getFieldValue('choice')).toBe('a')

    fireEvent.focusOut(b, { relatedTarget: document.body })

    expect(form.getFieldValue('choice')).toBe('b')
  })
})
